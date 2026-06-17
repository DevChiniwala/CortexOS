use async_trait::async_trait;
use crate::orchestration::agent::{Agent, AgentContext, LlmClient, Message};

pub struct CopywriterAgent {
    llm: LlmClient,
}

impl CopywriterAgent {
    pub fn new(api_key: String, model: String) -> Self {
        Self {
            llm: LlmClient::new(api_key, model),
        }
    }
}

#[async_trait]
impl Agent for CopywriterAgent {
    fn name(&self) -> &str {
        "CopywriterAgent"
    }

    fn system_prompt(&self) -> String {
        r#"You are an expert B2B outbound copywriter.
Your objective is to generate highly personalized, multi-threaded cold emails for a buying committee.
You will be provided with:
1. The company context and a recent trigger signal.
2. The buying committee members.

You must output ONLY valid JSON in the following format:
{
    "emails": [
        {
            "to": "CEO",
            "subject": "...",
            "body": "..."
        },
        {
            "to": "VP of Sales",
            "subject": "...",
            "body": "..."
        }
    ]
}"#
        .to_string()
    }

    async fn execute(&self, context: &mut AgentContext, input: &str) -> Result<String, String> {
        let prompt = format!("Company and Committee Information:\n{}", input);

        let messages = vec![
            Message {
                role: "user".to_string(),
                content: prompt,
            }
        ];
        
        let response = self.llm.completion(&self.system_prompt(), &messages).await?;

        // Store generated copy in memory
        context.memory.insert("copywriter_raw_output", &response);

        Ok(response)
    }
}
