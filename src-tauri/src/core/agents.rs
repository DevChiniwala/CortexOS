use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use crate::core::{llm, tavily};

/// The output artifact from a single specialist agent run.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentArtifact {
    pub agent_name: String,
    pub claims: Vec<(llm::ExtractedClaim, llm::VerificationResult)>,
    pub raw_claim_count: usize,
    pub verified_claim_count: usize,
}

/// Context passed into every specialist agent.
pub struct AgentContext {
    pub app: AppHandle,
    pub lead_name: String,
    pub lead_id: i64,
}

/// Run a single specialist agent end-to-end:
///   1. Tavily search with the given query
///   2. Extract claims from each result
///   3. Verify claims against raw source text
///   4. Return an AgentArtifact containing only verified claims
async fn run_specialist(ctx: &AgentContext, agent_name: &str, query: &str) -> AgentArtifact {
    let _ = ctx.app.emit("stream_event", llm::LogEntry {
        log_type: "agent".to_string(),
        content: format!("[{}] Searching web: {}...", agent_name, query),
        timestamp: chrono::Utc::now().timestamp_millis(),
        tool_name: Some("search_web".to_string()),
    });

    let results = match tavily::search_web(query, 3).await {
        Ok(r) => r,
        Err(e) => {
            let _ = ctx.app.emit("stream_event", llm::LogEntry {
                log_type: "error".to_string(),
                content: format!("[{}] Search failed: {}", agent_name, e),
                timestamp: chrono::Utc::now().timestamp_millis(),
                tool_name: None,
            });
            return AgentArtifact {
                agent_name: agent_name.to_string(),
                claims: vec![],
                raw_claim_count: 0,
                verified_claim_count: 0,
            };
        }
    };

    let mut verified = Vec::new();
    let mut raw_count = 0;

    for res in results {
        let raw = match &res.raw_content {
            Some(r) if !r.is_empty() => r.clone(),
            _ => res.content.clone(),
        };

        let _ = ctx.app.emit("stream_event", llm::LogEntry {
            log_type: "system".to_string(),
            content: format!("[{}] Extracting from {}...", agent_name, res.url),
            timestamp: chrono::Utc::now().timestamp_millis(),
            tool_name: None,
        });

        if let Ok(claims) = llm::extract_claims(&raw, &res.url, agent_name).await {
            raw_count += claims.len();
            for claim in claims {
                let result = llm::verify_claim(&claim, &raw);
                if result.passed {
                    let _ = ctx.app.emit("stream_event", llm::LogEntry {
                        log_type: "system".to_string(),
                        content: format!("  ✓ [{}] Verified ({}%, {}): {}",
                            agent_name,
                            (result.confidence * 100.0) as u32,
                            result.match_type,
                            &claim.claim[..std::cmp::min(80, claim.claim.len())]
                        ),
                        timestamp: chrono::Utc::now().timestamp_millis(),
                        tool_name: None,
                    });
                    verified.push((claim, result));
                }
            }
        }
    }

    let _ = ctx.app.emit("stream_event", llm::LogEntry {
        log_type: "system".to_string(),
        content: format!("[{}] Done. {} / {} claims verified.", agent_name, verified.len(), raw_count),
        timestamp: chrono::Utc::now().timestamp_millis(),
        tool_name: None,
    });

    AgentArtifact {
        agent_name: agent_name.to_string(),
        claims: verified,
        raw_claim_count: raw_count,
        verified_claim_count: verified.len(),
    }
}

// ─── Individual Specialist Functions ───────────────────────────────
// Each has a consistent signature: async fn(ctx: &AgentContext) -> AgentArtifact
// This makes them independently callable from the DAG executor.

pub async fn business_model_agent(ctx: &AgentContext) -> AgentArtifact {
    let query = format!("{} business model products services pricing", ctx.lead_name);
    run_specialist(ctx, "Business Model", &query).await
}

pub async fn recent_triggers_agent(ctx: &AgentContext) -> AgentArtifact {
    let query = format!("{} recent news funding leadership changes 2024 2025 2026", ctx.lead_name);
    run_specialist(ctx, "Recent Triggers", &query).await
}

pub async fn tech_stack_agent(ctx: &AgentContext) -> AgentArtifact {
    let query = format!("{} tech stack engineering jobs technology infrastructure", ctx.lead_name);
    run_specialist(ctx, "Tech Stack", &query).await
}

pub async fn pain_points_agent(ctx: &AgentContext) -> AgentArtifact {
    let query = format!("{} competitors alternatives complaints reviews", ctx.lead_name);
    run_specialist(ctx, "Pain Points", &query).await
}

pub async fn score_icp_agent(ctx: &AgentContext) -> AgentArtifact {
    let query = format!("{} company size industry revenue employees", ctx.lead_name);
    run_specialist(ctx, "ICP Scorer", &query).await
}

// ─── Verifier (operates on upstream artifacts) ─────────────────────

/// Aggregate and re-verify claims from multiple upstream agent artifacts.
/// Returns a single merged artifact with the union of all verified claims.
pub fn verify_artifacts(artifacts: &[AgentArtifact]) -> AgentArtifact {
    let mut all_claims = Vec::new();
    let mut total_raw = 0;

    for artifact in artifacts {
        total_raw += artifact.raw_claim_count;
        all_claims.extend(artifact.claims.clone());
    }

    AgentArtifact {
        agent_name: "Verifier".to_string(),
        claims: all_claims.clone(),
        raw_claim_count: total_raw,
        verified_claim_count: all_claims.len(),
    }
}

// ─── Synthesizer (generates the final profile) ────────────────────

/// Take verified claims, build the evidence block, call the streaming LLM,
/// and return the full markdown profile with inline citations.
pub async fn synthesize_profile(ctx: &AgentContext, artifacts: &[AgentArtifact]) -> Result<String, String> {
    let mut all_claims = Vec::new();
    for artifact in artifacts {
        all_claims.extend(artifact.claims.clone());
    }

    if all_claims.is_empty() {
        return Err("No verified claims to synthesize. All claims were dropped by the verifier.".to_string());
    }

    let mut evidence_str = String::new();
    for (i, (claim, _result)) in all_claims.iter().enumerate() {
        evidence_str.push_str(&format!("[{}]: \"{}\" (Source: {})\n", i + 1, claim.claim, claim.source_url));
    }

    let synthesis_prompt = format!(
        "You are a synthesis agent writing a unified company profile for {company}.\n\
        CRITICAL INSTRUCTION: You may ONLY use the verified facts provided below. \
        Do not hallucinate. Do not add external information. \
        Rejects anything you cannot directly support from the evidence.\n\
        For every claim you include, you MUST include the inline citation chip matching the source number (e.g., [1]).\n\n\
        VERIFIED EVIDENCE:\n{evidence}\n\n\
        Format the output as a structured markdown research brief with sections for:\n\
        1. Company Overview\n\
        2. Products & Services\n\
        3. Recent News & Triggers\n\
        4. Technology\n\
        5. Competitive Landscape\n\
        6. Potential Pain Points\n\
        7. Recommended Outreach Angles",
        company = ctx.lead_name,
        evidence = evidence_str,
    );

    let _ = ctx.app.emit("stream_event", llm::LogEntry {
        log_type: "system".to_string(),
        content: format!("Synthesizing profile from {} verified claims...", all_claims.len()),
        timestamp: chrono::Utc::now().timestamp_millis(),
        tool_name: None,
    });

    match llm::stream_research(ctx.app.clone(), synthesis_prompt).await {
        Ok(full_response) => {
            let mut final_output = full_response;
            final_output.push_str("\n\n---\n### Verified Evidence & Citations\n");
            for (i, (claim, result)) in all_claims.iter().enumerate() {
                let badge = if result.match_type == "fuzzy" {
                    format!("Likely Match ({}%)", (result.confidence * 100.0) as u32)
                } else {
                    "✓ Verified".to_string()
                };
                final_output.push_str(&format!("**[{}]** \"{}\" — [Source]({}) `{}`\n", i + 1, claim.quote, claim.source_url, badge));
            }

            let total_raw: usize = artifacts.iter().map(|a| a.raw_claim_count).sum();
            let trust_score = if total_raw > 0 {
                (all_claims.len() as f32 / total_raw as f32 * 100.0) as u32
            } else { 0 };

            final_output.push_str(&format!("\n**Trust Score: {}%** ({} / {} claims verified against source)\n", trust_score, all_claims.len(), total_raw));

            let _ = ctx.app.emit("stream_event", llm::LogEntry {
                log_type: "agent".to_string(),
                content: format!("\n\n**Trust Score: {}%** ({}/{} claims verified)\n", trust_score, all_claims.len(), total_raw),
                timestamp: chrono::Utc::now().timestamp_millis(),
                tool_name: None,
            });

            Ok(final_output)
        }
        Err(e) => Err(format!("Synthesis LLM error: {}", e))
    }
}
