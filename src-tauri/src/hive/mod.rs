use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HiveTask {
    pub id: String,
    pub description: String,
    pub status: String,
}

pub struct HiveWorker {
    pub id: String,
    pub capabilities: Vec<String>,
}

pub struct TaskGraph {
    pub tasks: Vec<HiveTask>,
}

impl TaskGraph {
    pub fn new() -> Self {
        Self { tasks: Vec::new() }
    }

    pub fn assign(&self, _worker: &HiveWorker, _task: &HiveTask) {
        // Assign task to worker
    }
}
