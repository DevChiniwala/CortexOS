use tauri::{AppHandle, Emitter, State};
use crate::db::DbState;
use crate::db::queries;
use crate::db::schema::JobRow;
use crate::events;
use crate::core::llm;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResearchResult {
    pub job_id: String,
    pub status: String,
}

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StreamEvent {
    pub job_id: String,
    pub event_type: String,
    pub content: String,
    pub timestamp: i64,
}

#[tauri::command]
pub async fn start_research(
    lead_id: i64,
    custom_prompt: Option<String>,
    research_depth: Option<String>,
    app: AppHandle,
    db: State<'_, DbState>,
) -> Result<ResearchResult, String> {
    let job_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    // Fetch the lead to build a prompt
    let lead_name = {
        let conn = db.conn.lock().map_err(|e| e.to_string())?;
        let lead = queries::get_lead(&conn, lead_id)?;
        match lead {
            Some(l) => l.company_name,
            None => return Err(format!("Lead {} not found", lead_id)),
        }
    };

    let job = JobRow {
        id: job_id.clone(),
        job_type: "company_research".to_string(),
        entity_id: lead_id,
        entity_label: lead_name.clone(),
        status: "running".to_string(),
        prompt: custom_prompt.clone().unwrap_or_else(|| format!("Research {}", lead_name)),
        model: Some("gemini-2.5-flash".to_string()),
        working_dir: format!("/tmp/cortex/{}", job_id),
        output_path: None,
        exit_code: None,
        error_message: None,
        created_at: now,
        started_at: Some(now),
        completed_at: None,
        pid: None,
    };

    {
        let conn = db.conn.lock().map_err(|e| e.to_string())?;
        queries::insert_job(&conn, &job)?;
        queries::update_lead_research_status(&conn, lead_id, "researching")?;
    }

    events::emit_job_created(&app, job_id.clone(), "company_research".to_string(), Some(lead_id));

    // Build the LLM prompt
    let depth_str = research_depth.unwrap_or_else(|| "standard".to_string());
    let prompt = custom_prompt.unwrap_or_else(|| {
        format!(
            "Research the company \"{}\" thoroughly. Depth: {}.\n\n\
             Provide:\n\
             1. Company overview (what they do, founding year, HQ)\n\
             2. Key products and services\n\
             3. Recent news and funding events\n\
             4. Competitive landscape\n\
             5. Potential pain points relevant to B2B sales\n\
             6. Recommended outreach angles\n\
             7. Key decision makers to target\n\n\
             Format the output as a structured research brief.",
            lead_name, depth_str
        )
    });

    // Spawn the grounded research pipeline on a background task
    let app_clone = app.clone();
    let job_id_clone = job_id.clone();
    let db_inner = db.inner().clone();
    let lead_name_clone = lead_name.clone();

    tauri::async_runtime::spawn(async move {
        let ctx = crate::core::agents::AgentContext {
            app: app_clone.clone(),
            lead_name: lead_name_clone.clone(),
            lead_id,
        };

        let _ = app_clone.emit("stream_event", llm::LogEntry {
            log_type: "system".to_string(),
            content: "Initializing Multi-Agent Grounded Research Pipeline...".to_string(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            tool_name: None,
        });

        // Run all 4 specialists concurrently
        let (biz, triggers, tech, pain) = tokio::join!(
            crate::core::agents::business_model_agent(&ctx),
            crate::core::agents::recent_triggers_agent(&ctx),
            crate::core::agents::tech_stack_agent(&ctx),
            crate::core::agents::pain_points_agent(&ctx),
        );

        let artifacts = vec![biz, triggers, tech, pain];

        let total_raw: usize = artifacts.iter().map(|a| a.raw_claim_count).sum();
        let total_verified: usize = artifacts.iter().map(|a| a.verified_claim_count).sum();

        let _ = app_clone.emit("stream_event", llm::LogEntry {
            log_type: "system".to_string(),
            content: format!("Verification complete. {} / {} claims passed source check.", total_verified, total_raw),
            timestamp: chrono::Utc::now().timestamp_millis(),
            tool_name: None,
        });

        // Synthesize final profile
        match crate::core::agents::synthesize_profile(&ctx, &artifacts).await {
            Ok(final_output) => {
                if let Ok(conn) = db_inner.conn.lock() {
                    let _ = queries::save_lead_company_profile(&conn, lead_id, &final_output);
                }

                // Commit to vector memory
                let _ = app_clone.emit("stream_event", llm::LogEntry {
                    log_type: "system".to_string(),
                    content: "Committing profile to Vector Memory...".to_string(),
                    timestamp: chrono::Utc::now().timestamp_millis(),
                    tool_name: None,
                });

                if let Ok(embedding) = llm::generate_embedding(&final_output).await {
                    if let Ok(conn) = db_inner.conn.lock() {
                        let _ = crate::core::memory::store_memory(&conn, lead_id, &final_output, &embedding);
                    }
                }

                if let Ok(conn) = db_inner.conn.lock() {
                    let _ = queries::update_job_status(&conn, &job_id_clone, "completed", Some(0));
                }
                events::emit_job_status_changed(&app_clone, job_id_clone, "completed".to_string(), Some(0));
            }
            Err(err) => {
                let _ = app_clone.emit("stream_event", llm::LogEntry {
                    log_type: "error".to_string(),
                    content: format!("Pipeline Error: {}", err),
                    timestamp: chrono::Utc::now().timestamp_millis(),
                    tool_name: None,
                });
                if let Ok(conn) = db_inner.conn.lock() {
                    let _ = queries::update_job_status(&conn, &job_id_clone, "failed", Some(1));
                }
                events::emit_job_status_changed(&app_clone, job_id_clone, "failed".to_string(), Some(1));
            }
        }
    });

    Ok(ResearchResult {
        job_id,
        status: "started".to_string(),
    })
}

#[tauri::command]
pub async fn start_person_research(
    person_id: i64,
    custom_prompt: Option<String>,
    app: AppHandle,
    db: State<'_, DbState>,
) -> Result<ResearchResult, String> {
    let job_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    let person_name = {
        let conn = db.conn.lock().map_err(|e| e.to_string())?;
        let person = queries::get_person(&conn, person_id)?;
        match person {
            Some(p) => format!("{} {}", p.first_name, p.last_name),
            None => return Err(format!("Person {} not found", person_id)),
        }
    };

    let job = JobRow {
        id: job_id.clone(),
        job_type: "person_research".to_string(),
        entity_id: person_id,
        entity_label: person_name.clone(),
        status: "running".to_string(),
        prompt: custom_prompt.clone().unwrap_or_else(|| format!("Research {}", person_name)),
        model: Some("gemini-2.5-flash".to_string()),
        working_dir: format!("/tmp/cortex/{}", job_id),
        output_path: None,
        exit_code: None,
        error_message: None,
        created_at: now,
        started_at: Some(now),
        completed_at: None,
        pid: None,
    };

    {
        let conn = db.conn.lock().map_err(|e| e.to_string())?;
        queries::insert_job(&conn, &job)?;
    }

    events::emit_job_created(&app, job_id.clone(), "person_research".to_string(), Some(person_id));

    let prompt = custom_prompt.unwrap_or_else(|| {
        format!(
            "Synthesize a professional intelligence brief for \"{}\" strictly using the provided verified evidence.\n\n\
             Provide:\n\
             1. Professional background and career trajectory\n\
             2. Key responsibilities in their current role\n\
             3. Potential conversation starters based on verified facts\n\
             4. Recommended personalized outreach approach\n\n\
             DO NOT invent or hallucinate any details, especially social media activity.\n\
             Format as a person intelligence brief.",
            person_name
        )
    });

    let app_clone = app.clone();
    let job_id_clone = job_id.clone();
    let db_inner = db.inner().clone();
    let person_name_clone = person_name.clone();

    tauri::async_runtime::spawn(async move {
        // Step 1: Search the web for the person
        let search_query = format!("{} professional background linkedin", person_name_clone);
        let _ = app_clone.emit("stream_event", llm::LogEntry {
            log_type: "system".to_string(),
            content: format!("Searching web for: {}", search_query),
            timestamp: chrono::Utc::now().timestamp_millis(),
            tool_name: None,
        });

        let results = crate::core::tavily::search_web(&search_query, 3).await.unwrap_or_default();
        let mut verified_evidence = Vec::new();

        for res in results {
            let raw = res.raw_content.clone().unwrap_or(res.content.clone());
            
            // 1. Extract Name + Title
            if let Ok(people) = llm::extract_people(&raw, &res.url, &person_name_clone).await {
                for person in people {
                    if person.name.to_lowercase().contains(&person_name_clone.to_lowercase()) {
                        let result = llm::verify_person(&person, &raw);
                        if result.passed {
                            verified_evidence.push((
                                format!("{} is {}", person.name, person.title),
                                person.quote,
                                person.source_url,
                                result.match_type,
                                result.confidence
                            ));
                        }
                    }
                }
            }
            
            // 2. Extract broader claims about their career trajectory and responsibilities
            if let Ok(claims) = llm::extract_claims(&raw, &res.url, &person_name_clone).await {
                for claim in claims {
                    let result = llm::verify_claim(&claim, &raw);
                    if result.passed {
                        verified_evidence.push((
                            claim.claim,
                            claim.quote,
                            claim.source_url,
                            result.match_type,
                            result.confidence
                        ));
                    }
                }
            }
        }

        let mut evidence_str = String::new();
        for (i, (claim, quote, url, _, _)) in verified_evidence.iter().enumerate() {
            evidence_str.push_str(&format!("[{}]: {} \"{}\" (Source: {})\n", i + 1, claim, quote, url));
        }

        let grounded_prompt = if verified_evidence.is_empty() {
            format!("The system could not find any verified evidence for {}. Output a brief stating exactly that: 'No verified data available.' DO NOT guess or hallucinate any details about them.", person_name_clone)
        } else {
            format!(
                "{} \n\nCRITICAL INSTRUCTION: You MUST use the verified facts below and include inline citations [1].\n\nVERIFIED EVIDENCE:\n{}",
                prompt, evidence_str
            )
        };

        match llm::stream_research(app_clone.clone(), grounded_prompt).await {
            Ok(full_response) => {
                let mut final_output = full_response;
                if !verified_evidence.is_empty() {
                    final_output.push_str("\n\n---\n### Verified Evidence & Citations\n");
                    for (i, (_, quote, url, match_type, conf)) in verified_evidence.iter().enumerate() {
                        let badge = if match_type == "fuzzy" {
                            format!("Likely Match ({}%)", (conf * 100.0) as u32)
                        } else {
                            "✓ Verified".to_string()
                        };
                        final_output.push_str(&format!("**[{}]** \"{}\" — [Source]({}) `{}`\n", i + 1, quote, url, badge));
                    }
                }

                if let Ok(conn) = db_inner.conn.lock() {
                    // Save to person profile (assumes a queries::save_person_profile exists or update person)
                    // Just update the status for now as before.
                    let _ = queries::update_job_status(&conn, &job_id_clone, "completed", Some(0));
                    // Update person research status
                    let _ = conn.execute(
                        "UPDATE contacts SET research_status = 'completed', person_profile = ?1, researched_at = ?2 WHERE id = ?3",
                        (final_output, chrono::Utc::now().timestamp_millis(), person_id)
                    );
                }
                events::emit_job_status_changed(&app_clone, job_id_clone, "completed".to_string(), Some(0));
            }
            Err(err) => {
                let _ = app_clone.emit("stream_event", llm::LogEntry {
                    log_type: "error".to_string(),
                    content: format!("LLM Error: {}", err),
                    timestamp: chrono::Utc::now().timestamp_millis(),
                    tool_name: None,
                });
                if let Ok(conn) = db_inner.conn.lock() {
                    let _ = queries::update_job_status(&conn, &job_id_clone, "failed", Some(1));
                }
                events::emit_job_status_changed(&app_clone, job_id_clone, "failed".to_string(), Some(1));
            }
        }
    });

    Ok(ResearchResult {
        job_id,
        status: "started".to_string(),
    })
}

#[tauri::command]
pub async fn start_scoring(
    lead_id: i64,
    app: AppHandle,
    db: State<'_, DbState>,
) -> Result<ResearchResult, String> {
    let job_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    let lead_name = {
        let conn = db.conn.lock().map_err(|e| e.to_string())?;
        let lead = queries::get_lead(&conn, lead_id)?;
        match lead {
            Some(l) => l.company_name,
            None => return Err(format!("Lead {} not found", lead_id)),
        }
    };

    let job = JobRow {
        id: job_id.clone(),
        job_type: "scoring".to_string(),
        entity_id: lead_id,
        entity_label: lead_name.clone(),
        status: "running".to_string(),
        prompt: format!("Score {}", lead_name),
        model: Some("gemini-2.5-flash".to_string()),
        working_dir: format!("/tmp/cortex/{}", job_id),
        output_path: None,
        exit_code: None,
        error_message: None,
        created_at: now,
        started_at: Some(now),
        completed_at: None,
        pid: None,
    };

    {
        let conn = db.conn.lock().map_err(|e| e.to_string())?;
        queries::insert_job(&conn, &job)?;
    }

    events::emit_job_created(&app, job_id.clone(), "scoring".to_string(), Some(lead_id));

    let prompt = format!(
        "Analyze and score the company \"{}\" as a B2B sales prospect.\n\n\
         Rate on a scale of 0-100 across these dimensions:\n\
         1. ICP Fit (industry, size, technology alignment)\n\
         2. Timing (recent signals suggesting buying intent)\n\
         3. Accessibility (ease of reaching decision makers)\n\
         4. Budget Likelihood (can they afford the solution)\n\n\
         Provide an overall composite score and reasoning.",
        lead_name
    );

    let app_clone = app.clone();
    let job_id_clone = job_id.clone();
    let db_inner = db.inner().clone();

    tauri::async_runtime::spawn(async move {
        match llm::stream_research(app_clone.clone(), prompt).await {
            Ok(_full_response) => {
                if let Ok(conn) = db_inner.conn.lock() {
                    let _ = queries::update_job_status(&conn, &job_id_clone, "completed", Some(0));
                }
                events::emit_job_status_changed(&app_clone, job_id_clone, "completed".to_string(), Some(0));
            }
            Err(_) => {
                if let Ok(conn) = db_inner.conn.lock() {
                    let _ = queries::update_job_status(&conn, &job_id_clone, "failed", Some(1));
                }
                events::emit_job_status_changed(&app_clone, job_id_clone, "failed".to_string(), Some(1));
            }
        }
    });

    Ok(ResearchResult {
        job_id,
        status: "started".to_string(),
    })
}

#[tauri::command]
pub async fn start_conversation_generation(
    person_id: i64,
    app: AppHandle,
    db: State<'_, DbState>,
) -> Result<ResearchResult, String> {
    let job_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    let person_name = {
        let conn = db.conn.lock().map_err(|e| e.to_string())?;
        let person = queries::get_person(&conn, person_id)?;
        match person {
            Some(p) => format!("{} {}", p.first_name, p.last_name),
            None => return Err(format!("Person {} not found", person_id)),
        }
    };

    let job = JobRow {
        id: job_id.clone(),
        job_type: "conversation".to_string(),
        entity_id: person_id,
        entity_label: person_name.clone(),
        status: "running".to_string(),
        prompt: format!("Generate outreach for {}", person_name),
        model: Some("gemini-2.5-flash".to_string()),
        working_dir: format!("/tmp/cortex/{}", job_id),
        output_path: None,
        exit_code: None,
        error_message: None,
        created_at: now,
        started_at: Some(now),
        completed_at: None,
        pid: None,
    };

    {
        let conn = db.conn.lock().map_err(|e| e.to_string())?;
        queries::insert_job(&conn, &job)?;
    }

    events::emit_job_created(&app, job_id.clone(), "conversation".to_string(), Some(person_id));

    let prompt = format!(
        "Generate a hyper-personalized outreach sequence for \"{}\".\n\n\
         Create:\n\
         1. A cold email (subject + body) that references their background\n\
         2. A LinkedIn connection request message\n\
         3. A follow-up email for 3 days later\n\
         4. Suggested talking points for a discovery call\n\n\
         Make the tone professional but human. Avoid generic corporate speak.",
        person_name
    );

    let app_clone = app.clone();
    let job_id_clone = job_id.clone();
    let db_inner = db.inner().clone();

    let person_name_clone = person_name.clone();

    tauri::async_runtime::spawn(async move {
        // --- RAG RETRIEVAL PHASE ---
        let _ = app_clone.emit("stream_event", llm::LogEntry {
            log_type: "system".to_string(),
            content: "Searching Vector Memory for semantic matches...".to_string(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            tool_name: None,
        });

        let mut rag_context = String::new();
        if let Ok(embedding) = llm::generate_embedding(&person_name_clone).await {
            if let Ok(conn) = db_inner.conn.lock() {
                if let Ok(memories) = crate::core::memory::search_memories(&conn, &embedding, 3) {
                    if !memories.is_empty() {
                        rag_context.push_str("\n\n--- MEMORY LAYER: PAST CONTEXT & PROFILES ---\nUse these highly-relevant semantic memories to inform your outreach strategy:\n");
                        for mem in memories {
                            rag_context.push_str(&format!("[Past Company Profile]:\n{}\n\n", mem.text_content));
                        }
                    }
                }
            }
        }
        
        let final_prompt = format!("{}\n{}", prompt, rag_context);

        match llm::stream_research(app_clone.clone(), final_prompt).await {
            Ok(_full_response) => {
                if let Ok(conn) = db_inner.conn.lock() {
                    let _ = queries::update_job_status(&conn, &job_id_clone, "completed", Some(0));
                }
                events::emit_job_status_changed(&app_clone, job_id_clone, "completed".to_string(), Some(0));
            }
            Err(_) => {
                if let Ok(conn) = db_inner.conn.lock() {
                    let _ = queries::update_job_status(&conn, &job_id_clone, "failed", Some(1));
                }
                events::emit_job_status_changed(&app_clone, job_id_clone, "failed".to_string(), Some(1));
            }
        }
    });

    Ok(ResearchResult {
        job_id,
        status: "started".to_string(),
    })
}
