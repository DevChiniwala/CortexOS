use async_trait::async_trait;
use crate::orchestration::agent::{Agent, AgentContext, LlmClient, Message};

pub struct ResearcherAgent {
    llm: LlmClient,
}

impl ResearcherAgent {
    pub fn new(api_key: String, model: String) -> Self {
        Self {
            llm: LlmClient::new(api_key, model),
        }
    }
}

#[async_trait]
impl Agent for ResearcherAgent {
    fn name(&self) -> &str {
        "ResearcherAgent"
    }

    fn system_prompt(&self) -> String {
        r#"You are an expert B2B sales researcher. 
Your objective is to identify the buying committee for a target company.
You must output ONLY valid JSON in the following format:
{
    "buying_committee": [
        { "title": "CEO", "name": "...", "confidence": 0.9 },
        { "title": "VP of Sales", "name": "...", "confidence": 0.8 },
        { "title": "IT Director", "name": "...", "confidence": 0.8 }
    ],
    "company_summary": "..."
}"#
        .to_string()
    }

    async fn execute(&self, context: &mut AgentContext, input: &str) -> Result<String, String> {
        // Build the prompt context
        let prompt = format!("Target Company Information:\n{}", input);

        let messages = vec![
            Message {
                role: "user".to_string(),
                content: prompt,
            }
        ];

        // In a full implementation, we might perform a web search here before calling the LLM
        // For now, we simulate the LLM call directly using the context we have
        
        // Execute LLM call
        let response = self.llm.completion(&self.system_prompt(), &messages).await?;

        // Store some metadata in working memory
        context.memory.insert("last_researched_entity".to_string(), input.to_string());
        context.memory.insert("researcher_raw_output".to_string(), response.clone());

        Ok(response)
    }
}
