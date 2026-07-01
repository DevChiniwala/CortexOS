use async_trait::async_trait;
use crate::orchestration::agent::{Agent, AgentContext, LlmClient, Message};
use crate::core::tavily::search_web;

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
        use crate::core::llm::{extract_claims, verify_claim};

        let first_line = input.lines().next().unwrap_or(input).to_string();
        let search_query = format!("{} latest news company details about contact", first_line);
        
        let results = search_web(&search_query, 5).await.unwrap_or_default();
        let mut verified_claims = Vec::new();

        for res in results {
            let raw = res.raw_content.clone().unwrap_or(res.content.clone());
            if let Ok(claims) = extract_claims(&raw, &res.url, &first_line).await {
                for claim in claims {
                    let result = verify_claim(&claim, &raw);
                    if result.passed {
                        verified_claims.push((claim, result));
                    }
                }
            }
        }

        let mut verified_context_str = String::new();
        for (claim, result) in verified_claims {
            verified_context_str.push_str(&format!(
                "- Fact: {} (Confidence: {}, Source: {})\n",
                claim.claim, result.confidence, claim.source_url
            ));
        }

        if verified_context_str.is_empty() {
            verified_context_str.push_str("No verified facts could be established from the web search.");
        }

        let prompt = format!(
            "CRM Record to Verify:\n{}\n\nVerified Live Web Facts:\n{}", 
            input, verified_context_str
        );

        let messages = vec![
            Message {
                role: "user".to_string(),
                content: prompt,
            }
        ];

        let response = self.llm.completion(&self.system_prompt(), &messages).await?;

        context.memory.insert("data_verifier_raw_output".to_string(), response.clone());

        Ok(response)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[tokio::test]
    async fn test_data_verifier_real_run() {
        dotenv::dotenv().ok();
        let api_key = std::env::var("GEMINI_API_KEY").expect("GEMINI_API_KEY must be set");
        let agent = DataVerifierAgent::new(api_key, "gemini-2.5-flash".to_string());
        
        let mut context = AgentContext {
            job_id: "test-verifier-job".to_string(),
            working_dir: std::path::PathBuf::from("/tmp"),
            memory: HashMap::new(),
        };

        // Test CRM record with an obvious fake detail to force correction
        let crm_input = "Company: Stripe\nCEO: Elon Musk\nHQ: Mars\nIndustry: Payment Processing";
        
        println!("--- RUNNING DATA VERIFIER ON STRIPE (Fake CEO/HQ in CRM) ---");
        let output = agent.execute(&mut context, crm_input).await.unwrap();
        println!("{}", serde_json::to_string_pretty(&serde_json::from_str::<serde_json::Value>(&output).unwrap()).unwrap());
    }
}
