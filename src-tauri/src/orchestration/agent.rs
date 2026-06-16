use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone)]
pub struct AgentContext {
    pub job_id: String,
    pub working_dir: std::path::PathBuf,
    pub memory: HashMap<String, String>,
}

#[async_trait::async_trait]
pub trait Agent: Send + Sync {
    /// Name of the agent (e.g. "DataVerifier", "ResearchAgent")
    fn name(&self) -> &str;
    
    /// The system prompt that guides this agent's behavior
    fn system_prompt(&self) -> String;

    /// Execute the agent's main loop/task
    async fn execute(&self, context: &mut AgentContext, input: &str) -> Result<String, String>;
}

pub struct LlmClient {
    client: reqwest::Client,
    api_key: String,
    model: String,
}

impl LlmClient {
    pub fn new(api_key: String, model: String) -> Self {
        Self {
            client: reqwest::Client::new(),
            api_key,
            model,
        }
    }

    pub async fn completion(&self, system_prompt: &str, messages: &[Message]) -> Result<String, String> {
        // Stub implementation - will be expanded to support Anthropic/OpenAI
        // For now, it just simulates an API call
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        Ok(format!("Simulated response from {} acting as {}", self.model, system_prompt))
    }
}
