use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SignalType {
    Funding,
    Hiring,
    ProductLaunch,
    ExecChange,
    TechStack,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SignalStrength {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Signal {
    pub id: String,
    pub entity_id: i64,
    pub signal_type: SignalType,
    pub strength: SignalStrength,
    pub description: String,
    pub detected_at: i64,
}

pub struct SignalDetector {
    // Logic for analyzing raw text for signals
}

impl SignalDetector {
    pub fn new() -> Self {
        Self {}
    }

    pub fn analyze(&self, _text: &str) -> Vec<Signal> {
        // Implementation
        Vec::new()
    }
}
