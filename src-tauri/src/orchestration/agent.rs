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

    pub async fn completion(&self, system_prompt: &str, _messages: &[Message]) -> Result<String, String> {
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
            self.model, self.api_key
        );

        let body = serde_json::json!({
            "systemInstruction": {
                "parts": [{ "text": system_prompt }]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{ "text": _messages.last().map(|m| m.content.as_str()).unwrap_or("") }]
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 4096,
            },
        });

        let resp = self.client.post(&url)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Gemini request failed: {}", e))?;

        let status = resp.status();
        let text = resp.text().await.map_err(|e| e.to_string())?;

        if !status.is_success() {
            return Err(format!("Gemini API error ({}): {}", status, text));
        }

        let json: serde_json::Value = serde_json::from_str(&text)
            .map_err(|e| format!("Failed to parse Gemini response: {}", e))?;

        let content = json["candidates"]
            .get(0)
            .and_then(|c| c["content"]["parts"].get(0))
            .and_then(|p| p["text"].as_str())
            .unwrap_or("")
            .to_string();

        Ok(content)
    }
}
