use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryNode {
    pub id: String,
    pub label: String,
    pub confidence: f32,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEdge {
    pub source: String,
    pub target: String,
    pub relation: String,
    pub weight: f32,
}

pub struct MemoryGraph {
    pub nodes: Vec<MemoryNode>,
    pub edges: Vec<MemoryEdge>,
}

impl MemoryGraph {
    pub fn new() -> Self {
        Self {
            nodes: Vec::new(),
            edges: Vec::new(),
        }
    }

    pub fn add_node(&mut self, node: MemoryNode) {
        self.nodes.push(node);
    }

    pub fn add_edge(&mut self, edge: MemoryEdge) {
        self.edges.push(edge);
    }
}
