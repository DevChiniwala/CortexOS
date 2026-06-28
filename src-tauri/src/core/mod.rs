/// Cortex Core Logic
/// Abstract modular structure for the backend domain models and logic.

pub mod llm;
pub mod apollo;
pub mod flow;

pub mod models {
    use serde::{Deserialize, Serialize};

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Agent {
        pub id: String,
        pub name: String,
        pub status: String,
        pub active_task: Option<String>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct MemoryNode {
        pub id: String,
        pub label: String,
        pub confidence: f32,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Signal {
        pub id: String,
        pub signal_type: String, // "funding", "hiring", "product"
        pub value: i32,
    }
}
