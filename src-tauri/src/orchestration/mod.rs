use serde::{Deserialize, Serialize};

/// Represents the requested depth of research for an agent to perform
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ResearchDepth {
    Light,
    Standard,
    Deep,
}

impl Default for ResearchDepth {
    fn default() -> Self {
        ResearchDepth::Standard
    }
}

/// A prepared workspace directory structure for a research job
#[derive(Debug, Clone)]
pub struct PreparedWorkspace {
    pub root_dir: std::path::PathBuf,
    pub session_id: String,
}

pub struct OrchestrationEngine {
    // Core engine state
}

impl OrchestrationEngine {
    pub fn new() -> Self {
        Self {}
    }

    /// Prepares a fresh workspace directory for a new research job
    pub fn prepare_workspace(&self, _target_id: i64) -> Result<PreparedWorkspace, String> {
        let session_id = uuid::Uuid::new_v4().to_string();
        let root_dir = std::env::temp_dir().join(format!("cortexos-{}", session_id));
        std::fs::create_dir_all(&root_dir).map_err(|e| e.to_string())?;

        Ok(PreparedWorkspace {
            root_dir,
            session_id,
        })
    }
}
