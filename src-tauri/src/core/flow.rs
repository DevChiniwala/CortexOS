use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use tauri::{AppHandle, Emitter};
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
}

pub async fn execute_dag(app: AppHandle, payload: FlowPayload) -> Result<(), String> {
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

    // 3. Execute Nodes
    for node_id in sorted_nodes {
        let node = payload.nodes.iter().find(|n| n.id == node_id).unwrap();
        
        let _ = app.emit("flow_node_started", serde_json::json!({ "nodeId": node.id }));
        
        // Match node type based on ID prefix
        if node.id.starts_with("research") {
            let _ = llm::stream_research(app.clone(), "Research task triggered from flow".to_string()).await;
        } else if node.id.starts_with("generate") {
            let _ = llm::stream_research(app.clone(), "Generate draft task triggered from flow".to_string()).await;
        } else {
            // Simulated execution for other nodes
            tokio::time::sleep(std::time::Duration::from_millis(1500)).await;
        }

        let _ = app.emit("flow_node_completed", serde_json::json!({ "nodeId": node.id }));
    }

    let _ = app.emit("flow_completed", serde_json::json!({ "status": "success" }));
    Ok(())
}
