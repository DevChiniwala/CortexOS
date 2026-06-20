use async_trait::async_trait;
use crate::orchestration::agent::{Agent, AgentContext, LlmClient, Message};

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
        let prompt = format!(
            "Generate a competitive Battlecard based on the following information:\n{}",
            input
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
