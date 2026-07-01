use async_trait::async_trait;
use crate::orchestration::agent::{Agent, AgentContext, LlmClient, Message};
use crate::core::tavily::search_web;

pub struct StrategistAgent {
    llm: LlmClient,
}

impl StrategistAgent {
    pub fn new(api_key: String, model: String) -> Self {
        Self {
            llm: LlmClient::new(api_key, model),
        }
    }
}

#[async_trait]
impl Agent for StrategistAgent {
    fn name(&self) -> &str {
        "StrategistAgent"
    }

    fn system_prompt(&self) -> String {
        r#"You are an elite competitive intelligence strategist for B2B sales teams.
Your objective is to generate a "Battlecard" — a concise cheat-sheet a sales rep can use in a live deal against a specific competitor.

You will be provided with:
1. The target company's profile and recent signals.
2. The competitor being evaluated by the target.

You must output ONLY valid JSON in the following format:
{
    "competitor_name": "...",
    "overview": "A 2-sentence summary of the competitor.",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
    "talk_tracks": [
        {
            "objection": "They say competitor X is cheaper.",
            "response": "While their list price may appear lower, ..."
        }
    ],
    "kill_criteria": [
        "If the prospect values X, we win because ...",
        "If the prospect values Y, this is a risk because ..."
    ],
    "recommended_approach": "Lead with our advantage in ... and position around ..."
}"#
        .to_string()
    }

    async fn execute(&self, context: &mut AgentContext, input: &str) -> Result<String, String> {
        use crate::core::llm::{extract_claims, verify_claim};

        let first_line = input.lines().next().unwrap_or(input).to_string();
        let search_query = format!("{} vs competitors reviews strengths weaknesses comparison", first_line);
        
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
            verified_context_str.push_str("No verified competitive facts could be established from the web search.");
        }

        let prompt = format!(
            "Generate a competitive Battlecard based on the following information:\n{}\n\nVerified Competitive Facts:\n{}",
            input, verified_context_str
        );

        let messages = vec![Message {
            role: "user".to_string(),
            content: prompt,
        }];

        let response = self.llm.completion(&self.system_prompt(), &messages).await?;

        context
            .memory
            .insert("strategist_raw_output".to_string(), response.clone());

        Ok(response)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[tokio::test]
    async fn test_strategist_real_run() {
        dotenv::dotenv().ok();
        let api_key = std::env::var("GEMINI_API_KEY").expect("GEMINI_API_KEY must be set");
        let agent = StrategistAgent::new(api_key, "gemini-2.5-flash".to_string());
        
        let mut context = AgentContext {
            job_id: "test-strategist-job".to_string(),
            working_dir: std::path::PathBuf::from("/tmp"),
            memory: HashMap::new(),
        };

        let strategist_input = "Target Company: Vercel\nCompetitor: Netlify";
        
        println!("--- RUNNING STRATEGIST: Vercel vs Netlify ---");
        let output = agent.execute(&mut context, strategist_input).await.unwrap();
        println!("{}", serde_json::to_string_pretty(&serde_json::from_str::<serde_json::Value>(&output).unwrap()).unwrap());
    }
}
