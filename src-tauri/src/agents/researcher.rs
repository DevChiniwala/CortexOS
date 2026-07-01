use async_trait::async_trait;
use crate::orchestration::agent::{Agent, AgentContext, LlmClient, Message};
use crate::core::tavily::search_web;

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
You must base your extraction ONLY on the provided Verified Search Context. Do not invent names.
If you cannot find a name for a role in the context, omit it or list it as "Unknown".
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
        let first_line = input.lines().next().unwrap_or(input);
        let search_query = format!("{} leadership team executive buying committee CEO VP", first_line);
        
        // Ground the LLM with live web data
        let mut context_str = String::new();
        if let Ok(results) = search_web(&search_query, 5).await {
            for res in results {
                context_str.push_str(&format!("Source: {}\nContent: {}\n\n", res.url, res.content));
            }
        }

        let prompt = format!(
            "Target Company Information:\n{}\n\nVerified Search Context (Extract committee ONLY from here):\n{}", 
            input, context_str
        );

        let messages = vec![
            Message {
                role: "user".to_string(),
                content: prompt,
            }
        ];
        
        // Execute LLM call
        let response = self.llm.completion(&self.system_prompt(), &messages).await?;

        // Store some metadata in working memory
        context.memory.insert("last_researched_entity".to_string(), input.to_string());
        context.memory.insert("researcher_raw_output".to_string(), response.clone());

        Ok(response)
    }
}
