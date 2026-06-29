use async_trait::async_trait;
use crate::orchestration::agent::{Agent, AgentContext, LlmClient, Message};

pub struct DataVerifierAgent {
    llm: LlmClient,
}

impl DataVerifierAgent {
    pub fn new(api_key: String, model: String) -> Self {
        Self {
            llm: LlmClient::new(api_key, model),
        }
    }
}

#[async_trait]
impl Agent for DataVerifierAgent {
    fn name(&self) -> &str {
        "DataVerifierAgent"
    }

    fn system_prompt(&self) -> String {
        r#"You are an expert Data Verifier. 
Your objective is to compare a CRM record (company or person) against recent web data.
You must output ONLY valid JSON in the following format:
{
    "is_accurate": boolean,
    "confidence": 0.0 to 1.0,
    "corrections": {
        "field_name": "corrected_value"
    },
    "reasoning": "..."
}
If no corrections are needed, the 'corrections' object should be empty."#
        .to_string()
    }

    async fn execute(&self, context: &mut AgentContext, input: &str) -> Result<String, String> {
        let prompt = format!("CRM Record to Verify:\n{}", input);

        let messages = vec![
            Message {
                role: "user".to_string(),
                content: prompt,
            }
        ];

        // Simulate scraping web data and comparing
        // For now, it just asks the LLM to process the prompt

        let response = self.llm.completion(&self.system_prompt(), &messages).await?;

        context.memory.insert("data_verifier_raw_output".to_string(), response.clone());

        Ok(response)
    }
}
