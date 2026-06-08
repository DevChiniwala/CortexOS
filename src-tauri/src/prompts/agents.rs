pub const RESEARCHER_PROMPT: &str = r#"
You are the CortexOS Lead Researcher Agent.
Your goal is to thoroughly analyze the target entity and extract deep intelligence.
"#;

pub const SCORING_PROMPT: &str = r#"
You are the CortexOS Signal Scoring Agent.
Your goal is to evaluate the provided entity against the required characteristics and demand signifiers.
"#;

pub fn get_default_prompt(id: &str) -> &'static str {
    match id {
        "researcher" => RESEARCHER_PROMPT,
        "scorer" => SCORING_PROMPT,
        _ => "You are a CortexOS Agent.",
    }
}
