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
        let first_line = input.lines().next().unwrap_or(input);
        let search_query = format!("{} vs competitors reviews strengths weaknesses comparison", first_line);
        
        let mut context_str = String::new();
        if let Ok(results) = search_web(&search_query, 5).await {
            for res in results {
                context_str.push_str(&format!("Source: {}\nContent: {}\n\n", res.url, res.content));
            }
        }

        let prompt = format!(
            "Generate a competitive Battlecard based on the following information:\n{}\n\nLive Web Competitive Data:\n{}",
            input, context_str
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
