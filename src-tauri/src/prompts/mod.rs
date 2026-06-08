pub mod agents;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptTemplate {
    pub id: String,
    pub name: String,
    pub template: String,
}

pub struct PromptManager {
    // Manages system prompt overrides from DB
}

impl PromptManager {
    pub fn new() -> Self {
        Self {}
    }

    pub fn get_prompt(&self, id: &str) -> String {
        // Fallback to static constants defined in `agents` module
        agents::get_default_prompt(id).to_string()
    }
}
