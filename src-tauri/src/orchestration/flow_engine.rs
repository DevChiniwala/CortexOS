use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use tracing::{info, error};

use crate::db::get_db_path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlowRule {
    pub id: String,
    pub trigger_type: String, // e.g. "signal"
    pub trigger_condition: String, // e.g. "funding_round"
    pub actions: Vec<FlowAction>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlowAction {
    pub action_type: String, // e.g. "generate_copy"
    pub prompt_override: Option<String>,
}

pub struct FlowEngine {
    // In a real system we would cache rules in memory
    // For now we just evaluate dynamically
}

impl FlowEngine {
    pub fn new() -> Self {
        Self {}
    }

    /// Called whenever a new signal is detected to see if it triggers any flows
    pub fn evaluate_signal(&self, lead_id: i64, signal_type: &str) {
        info!("Evaluating flows for signal type '{}' on lead {}", signal_type, lead_id);
        
        // Mocking a flow rule execution
        // Example: If a company gets funding, draft an email.
        if signal_type == "funding_round" {
            info!("Flow Engine: Funding round detected. Triggering copywriter job...");
            
            let conn = match Connection::open(get_db_path()) {
                Ok(c) => c,
                Err(e) => {
                    error!("Flow Engine failed to open DB: {}", e);
                    return;
                }
            };
            
            let job_id = uuid::Uuid::new_v4().to_string();
            let prompt = format!("Company {} just raised a funding round. Write an email to the CEO.", lead_id);
            
            let _ = conn.execute(
                "INSERT INTO jobs (id, job_type, entity_id, entity_label, status, prompt, created_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                rusqlite::params![
                    job_id,
                    "generate_copy",
                    lead_id,
                    "company",
                    "queued",
                    prompt,
                    chrono::Utc::now().timestamp_millis()
                ]
            );
        }
    }
}
