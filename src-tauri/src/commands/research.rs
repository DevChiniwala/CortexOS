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
        model: Some("gpt-4o".to_string()),
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

    // Spawn the LLM stream on a background task
    let app_clone = app.clone();
    let job_id_clone = job_id.clone();
    let db_inner = db.inner().clone();
    let lead_name_clone = lead_name.clone();

    tokio::spawn(async move {
        // --- GROUNDED RESEARCH PIPELINE ---
        let _ = app_clone.emit("stream_event", llm::LogEntry {
            log_type: "system".to_string(),
            content: "Initializing Multi-Agent Grounded Research Pipeline...".to_string(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            tool_name: None,
        });

        let topics = vec![
            ("Business Model & Core Offering", format!("{} business model and products", lead_name_clone)),
            ("Recent Triggers & News", format!("{} recent news funding leadership", lead_name_clone)),
            ("Technology Stack", format!("{} tech stack engineering jobs", lead_name_clone)),
            ("Competitors & Pain Points", format!("{} competitors alternatives", lead_name_clone)),
        ];

        let mut tasks = Vec::new();

        for (topic, query) in topics {
            let app_task = app_clone.clone();
            let topic_task = topic.to_string();
            let query_task = query.clone();

            let task = tokio::spawn(async move {
                let _ = app_task.emit("stream_event", llm::LogEntry {
                    log_type: "agent".to_string(),
                    content: format!("Searching web for: {}...", query_task),
                    timestamp: chrono::Utc::now().timestamp_millis(),
                    tool_name: Some("search_web".to_string()),
                });

                let results = match crate::core::tavily::search_web(&query_task, 2).await {
                    Ok(r) => r,
                    Err(_) => return vec![],
                };

                let mut verified = Vec::new();
                for res in results {
                    if let Some(raw) = &res.raw_content {
                        let _ = app_task.emit("stream_event", llm::LogEntry {
                            log_type: "system".to_string(),
                            content: format!("Extracting claims from {}...", res.url),
                            timestamp: chrono::Utc::now().timestamp_millis(),
                            tool_name: None,
                        });
                        
                        if let Ok(claims) = llm::extract_claims(raw, &res.url, &topic_task).await {
                            for claim in claims {
                                let result = llm::verify_claim(&claim, raw);
                                if result.passed {
                                    let _ = app_task.emit("stream_event", llm::LogEntry {
                                        log_type: "system".to_string(),
                                        content: format!("  ✓ Verified ({}%, {}): {}", (result.confidence * 100.0) as u32, result.match_type, &claim.claim[..std::cmp::min(80, claim.claim.len())]),
                                        timestamp: chrono::Utc::now().timestamp_millis(),
                                        tool_name: None,
                                    });
                                    verified.push(claim);
                                }
                            }
                        }
                    }
                }
                verified
            });
            tasks.push(task);
        }

        let mut all_verified_claims = Vec::new();
        let results = futures::future::join_all(tasks).await;
        for res in results {
            if let Ok(claims) = res {
                all_verified_claims.extend(claims);
            }
        }

        let _ = app_clone.emit("stream_event", llm::LogEntry {
            log_type: "system".to_string(),
            content: format!("Verification complete. {} claims passed verbatim source check.", all_verified_claims.len()),
            timestamp: chrono::Utc::now().timestamp_millis(),
            tool_name: None,
        });

        // Format claims for synthesis
        let mut evidence_str = String::new();
        for (i, claim) in all_verified_claims.iter().enumerate() {
            evidence_str.push_str(&format!("[{}]: \"{}\" (Source: {})\n", i + 1, claim.claim, claim.source_url));
        }

        let synthesis_prompt = format!(
            "You are a synthesis agent writing a unified company profile for {}.\n\
            CRITICAL INSTRUCTION: You may ONLY use the verified facts provided below. \
            Do not hallucinate. Do not add external information.\n\
            For every claim you include in your profile, you MUST include the inline citation chip matching the source number (e.g., [1]).\n\n\
            VERIFIED EVIDENCE:\n{}\n\n\
            Format the output as a beautifully structured markdown research brief.",
            lead_name_clone, evidence_str
        );

        match llm::stream_research(app_clone.clone(), synthesis_prompt).await {
            Ok(full_response) => {
                let mut final_output = full_response.clone();
                final_output.push_str("\n\n### Verified Evidence & Citations\n");
                
                let _ = app_clone.emit("stream_event", llm::LogEntry {
                    log_type: "agent".to_string(),
                    content: "\n\n### Verified Evidence & Citations\n".to_string(),
                    timestamp: chrono::Utc::now().timestamp_millis(),
                    tool_name: None,
                });

                for (i, claim) in all_verified_claims.iter().enumerate() {
                    let source_line = format!("**[{}]** \"{}\" — [Source]({})\n", i + 1, claim.quote, claim.source_url);
                    final_output.push_str(&source_line);
                    let _ = app_clone.emit("stream_event", llm::LogEntry {
                        log_type: "agent".to_string(),
                        content: source_line,
                        timestamp: chrono::Utc::now().timestamp_millis(),
                        tool_name: None,
                    });
                }

                // Save the research output to the database
                if let Ok(conn) = db_inner.conn.lock() {
                    let _ = queries::save_lead_company_profile(&conn, lead_id, &final_output);
                }
                
                // --- RAG STORAGE PHASE ---
                // Generate embedding of the final research and save it to vector memory
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
                let error_msg = format!("LLM Error: {}", err);
                let _ = app_clone.emit("stream_event", llm::LogEntry {
                    log_type: "error".to_string(),
                    content: error_msg.clone(),
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
        model: Some("gpt-4o".to_string()),
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
            "Research the person \"{}\" for B2B sales outreach.\n\n\
             Provide:\n\
             1. Professional background and career trajectory\n\
             2. Key responsibilities in their current role\n\
             3. Recent LinkedIn activity and posts\n\
             4. Potential conversation starters and pain points\n\
             5. Communication style preferences\n\
             6. Recommended personalized outreach approach\n\n\
             Format as a person intelligence brief.",
            person_name
        )
    });

    let app_clone = app.clone();
    let job_id_clone = job_id.clone();
    let db_inner = db.inner().clone();

    tokio::spawn(async move {
        match llm::stream_research(app_clone.clone(), prompt).await {
            Ok(_full_response) => {
                if let Ok(conn) = db_inner.conn.lock() {
                    let _ = queries::update_job_status(&conn, &job_id_clone, "completed", Some(0));
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
        model: Some("gpt-4o".to_string()),
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

    tokio::spawn(async move {
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
        model: Some("gpt-4o".to_string()),
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

    tokio::spawn(async move {
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
