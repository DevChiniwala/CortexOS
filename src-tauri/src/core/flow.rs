use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{AppHandle, Emitter};
use crate::core::agents::{self, AgentArtifact, AgentContext};
use crate::core::llm;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FlowNode {
    pub id: String,
    pub r#type: String,
    pub data: NodeData,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NodeData {
    pub label: String,
    pub description: Option<String>,
    /// The specialist type that this node dispatches to.
    /// Valid values: "source", "business_model", "recent_triggers", "tech_stack",
    ///   "pain_points", "icp_scorer", "verifier", "synthesizer", "draft_outreach",
    ///   "add_to_memory"
    pub node_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FlowEdge {
    pub id: String,
    pub source: String,
    pub target: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FlowPayload {
    pub nodes: Vec<FlowNode>,
    pub edges: Vec<FlowEdge>,
    pub lead_id: Option<i64>,
    pub lead_name: Option<String>,
}

pub async fn execute_dag(app: AppHandle, payload: FlowPayload) -> Result<(), String> {
    let lead_name = payload.lead_name.clone().unwrap_or_else(|| "Unknown Company".to_string());
    let lead_id = payload.lead_id.unwrap_or(0);

    let ctx = AgentContext {
        app: app.clone(),
        lead_name: lead_name.clone(),
        lead_id,
    };

    // 1. Build Adjacency List for topological sort
    let mut graph: HashMap<String, Vec<String>> = HashMap::new();
    let mut in_degree: HashMap<String, usize> = HashMap::new();

    for node in &payload.nodes {
        graph.insert(node.id.clone(), Vec::new());
        in_degree.insert(node.id.clone(), 0);
    }

    for edge in &payload.edges {
        if let Some(neighbors) = graph.get_mut(&edge.source) {
            neighbors.push(edge.target.clone());
        }
        if let Some(degree) = in_degree.get_mut(&edge.target) {
            *degree += 1;
        }
    }

    // 2. Topological Sort (Kahn's Algorithm)
    let mut queue: Vec<String> = Vec::new();
    for (node_id, &degree) in &in_degree {
        if degree == 0 {
            queue.push(node_id.clone());
        }
    }

    let mut sorted_nodes = Vec::new();
    while let Some(node_id) = queue.pop() {
        sorted_nodes.push(node_id.clone());
        if let Some(neighbors) = graph.get(&node_id) {
            for neighbor in neighbors {
                if let Some(degree) = in_degree.get_mut(neighbor) {
                    *degree -= 1;
                    if *degree == 0 {
                        queue.push(neighbor.clone());
                    }
                }
            }
        }
    }

    if sorted_nodes.len() != payload.nodes.len() {
        return Err("Cycle detected in flow DAG. Execution aborted.".into());
    }

    // 3. Execute Nodes — real dispatch table
    // Artifacts accumulate as upstream nodes complete.
    // Verifier and Synthesizer consume "whatever artifacts are present."
    let mut artifacts: Vec<AgentArtifact> = Vec::new();

    for node_id in &sorted_nodes {
        let node = payload.nodes.iter().find(|n| n.id == *node_id).unwrap();
        let node_type = node.data.node_type.as_deref()
            .unwrap_or_else(|| infer_node_type(&node.data.label));

        let _ = app.emit("flow_node_started", serde_json::json!({
            "nodeId": node.id,
            "nodeType": node_type,
            "label": node.data.label,
        }));

        let _ = app.emit("stream_event", llm::LogEntry {
            log_type: "system".to_string(),
            content: format!("▶ Executing node: {} ({})", node.data.label, node_type),
            timestamp: chrono::Utc::now().timestamp_millis(),
            tool_name: None,
        });

        match node_type {
            // ─── Source node: just announces the target ───
            "source" => {
                let _ = app.emit("stream_event", llm::LogEntry {
                    log_type: "system".to_string(),
                    content: format!("Target: {} (ID: {})", lead_name, lead_id),
                    timestamp: chrono::Utc::now().timestamp_millis(),
                    tool_name: None,
                });
            }

            // ─── Specialist agents ───
            "business_model" => {
                let artifact = agents::business_model_agent(&ctx).await;
                artifacts.push(artifact);
            }
            "recent_triggers" => {
                let artifact = agents::recent_triggers_agent(&ctx).await;
                artifacts.push(artifact);
            }
            "tech_stack" => {
                let artifact = agents::tech_stack_agent(&ctx).await;
                artifacts.push(artifact);
            }
            "pain_points" => {
                let artifact = agents::pain_points_agent(&ctx).await;
                artifacts.push(artifact);
            }
            "icp_scorer" => {
                let artifact = agents::score_icp_agent(&ctx).await;
                artifacts.push(artifact);
            }

            // ─── Verifier: consumes upstream artifacts ───
            "verifier" => {
                let merged = agents::verify_artifacts(&artifacts);
                let total_raw: usize = artifacts.iter().map(|a| a.raw_claim_count).sum();
                let total_verified: usize = artifacts.iter().map(|a| a.verified_claim_count).sum();

                let _ = app.emit("stream_event", llm::LogEntry {
                    log_type: "system".to_string(),
                    content: format!(
                        "Verification Gate: {} claims in → {} verified, {} dropped",
                        total_raw, total_verified, total_raw.saturating_sub(total_verified)
                    ),
                    timestamp: chrono::Utc::now().timestamp_millis(),
                    tool_name: None,
                });

                // Replace accumulated artifacts with the single merged one
                artifacts = vec![merged];
            }

            // ─── Synthesizer: generates the final profile ───
            "synthesizer" => {
                match agents::synthesize_profile(&ctx, &artifacts).await {
                    Ok(profile) => {
                        let _ = app.emit("stream_event", llm::LogEntry {
                            log_type: "result".to_string(),
                            content: "Profile synthesis complete.".to_string(),
                            timestamp: chrono::Utc::now().timestamp_millis(),
                            tool_name: None,
                        });

                        // Store the synthesized profile as a "Synthesizer" artifact
                        // so downstream action nodes can consume it
                        artifacts.push(AgentArtifact {
                            agent_name: "Synthesizer".to_string(),
                            claims: vec![],
                            raw_claim_count: 0,
                            verified_claim_count: 0,
                        });

                        // Emit the profile as a special event for the frontend
                        let _ = app.emit("flow_profile_ready", serde_json::json!({
                            "leadId": lead_id,
                            "profile": profile,
                        }));
                    }
                    Err(e) => {
                        let _ = app.emit("stream_event", llm::LogEntry {
                            log_type: "error".to_string(),
                            content: format!("Synthesis failed: {}", e),
                            timestamp: chrono::Utc::now().timestamp_millis(),
                            tool_name: None,
                        });
                    }
                }
            }

            // ─── Action nodes ───
            "draft_outreach" => {
                let _ = app.emit("stream_event", llm::LogEntry {
                    log_type: "agent".to_string(),
                    content: format!("Generating outreach drafts for {}...", lead_name),
                    timestamp: chrono::Utc::now().timestamp_millis(),
                    tool_name: None,
                });

                let prompt = format!(
                    "Generate a hyper-personalized outreach sequence for a contact at {}.\n\
                    Create:\n\
                    1. A cold email (subject + body)\n\
                    2. A LinkedIn connection request message\n\
                    3. A follow-up email for 3 days later\n\
                    Make the tone professional but human.",
                    lead_name
                );

                let _ = llm::stream_research(app.clone(), prompt).await;
            }

            "add_to_memory" => {
                let _ = app.emit("stream_event", llm::LogEntry {
                    log_type: "system".to_string(),
                    content: "Committing verified claims to Vector Memory...".to_string(),
                    timestamp: chrono::Utc::now().timestamp_millis(),
                    tool_name: None,
                });

                // Build a text blob from all verified claims and embed it
                let mut memory_text = String::new();
                for artifact in &artifacts {
                    for claim in &artifact.claims {
                        memory_text.push_str(&format!("{} ", claim.claim));
                    }
                }

                if !memory_text.is_empty() {
                    if let Ok(embedding) = llm::generate_embedding(&memory_text).await {
                        // We can't access DbState from here, so emit an event for the frontend
                        // to call the store_memory command
                        let _ = app.emit("flow_store_memory", serde_json::json!({
                            "leadId": lead_id,
                            "text": memory_text,
                            "embedding": embedding,
                        }));
                    }
                }
            }

            // ─── Unknown node type: skip gracefully ───
            other => {
                let _ = app.emit("stream_event", llm::LogEntry {
                    log_type: "system".to_string(),
                    content: format!("Skipping unknown node type: {}", other),
                    timestamp: chrono::Utc::now().timestamp_millis(),
                    tool_name: None,
                });
                tokio::time::sleep(std::time::Duration::from_millis(500)).await;
            }
        }

        let _ = app.emit("flow_node_completed", serde_json::json!({
            "nodeId": node.id,
            "nodeType": node_type,
        }));
    }

    let _ = app.emit("flow_completed", serde_json::json!({ "status": "success" }));
    Ok(())
}

/// Infer the node_type from the label string when node_type is not explicitly set.
/// This handles backwards compatibility with existing flow canvases.
fn infer_node_type(label: &str) -> &'static str {
    let lower = label.to_lowercase();
    if lower.contains("business") || lower.contains("offering") || lower.contains("product") {
        "business_model"
    } else if lower.contains("trigger") || lower.contains("news") || lower.contains("funding") {
        "recent_triggers"
    } else if lower.contains("tech") || lower.contains("stack") || lower.contains("engineering") {
        "tech_stack"
    } else if lower.contains("pain") || lower.contains("competitor") || lower.contains("alternative") {
        "pain_points"
    } else if lower.contains("verif") || lower.contains("audit") {
        "verifier"
    } else if lower.contains("synth") || lower.contains("profile") || lower.contains("report") {
        "synthesizer"
    } else if lower.contains("score") || lower.contains("icp") {
        "icp_scorer"
    } else if lower.contains("outreach") || lower.contains("draft") || lower.contains("email") {
        "draft_outreach"
    } else if lower.contains("memory") || lower.contains("remember") {
        "add_to_memory"
    } else if lower.contains("source") || lower.contains("company") || lower.contains("lead") || lower.contains("find") {
        "source"
    } else if lower.contains("research") {
        // "Deep Research" should run all 4 specialists + verifier + synthesizer in sequence
        "business_model"
    } else {
        "source"
    }
}
