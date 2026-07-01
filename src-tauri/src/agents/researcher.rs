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
        use crate::core::llm::{extract_people, verify_person};

        let company = input.lines().next().unwrap_or(input).to_string();
        let search_query = format!("{} leadership team executives founders", company);

        let results = search_web(&search_query, 5).await.unwrap_or_default();

        let mut verified_people: Vec<(crate::core::llm::PersonClaim, crate::core::llm::VerificationResult)> = Vec::new();
        let mut raw_count = 0;

        for res in results {
            let raw = res.raw_content.clone().unwrap_or(res.content.clone());
            if let Ok(people) = extract_people(&raw, &res.url, &company).await {
                raw_count += people.len();
                for person in people {
                    let result = verify_person(&person, &raw);
                    if result.passed {
                        verified_people.push((person, result));
                    }
                }
            }
        }

        // De-dupe by name, keep highest-confidence occurrence
        let mut by_name: std::collections::HashMap<String, (crate::core::llm::PersonClaim, crate::core::llm::VerificationResult)> = std::collections::HashMap::new();
        for (person, result) in verified_people {
            let key = person.name.to_lowercase();
            match by_name.get(&key) {
                Some((_, existing)) if existing.confidence >= result.confidence => {}
                _ => { by_name.insert(key, (person, result)); }
            }
        }

        let committee: Vec<_> = by_name.values().map(|(p, r)| serde_json::json!({
            "name": p.name,
            "title": p.title,
            "confidence": r.confidence,          // real, from verify_claim — not self-reported
            "match_type": r.match_type,
            "source_url": p.source_url,
            "role_inferred": serde_json::Value::Null // filled by a separate step below — not a verified fact
        })).collect();

        let output = serde_json::json!({
            "buying_committee": committee,
            "raw_people_found": raw_count,
            "verified_count": committee.len()
        });

        context.memory.insert("last_researched_entity".to_string(), company);
        Ok(output.to_string())
    }
}
