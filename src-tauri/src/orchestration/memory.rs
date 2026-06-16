use std::collections::HashMap;

/// Short-term memory for an agent's current task execution
#[derive(Debug, Default)]
pub struct WorkingMemory {
    store: HashMap<String, String>,
}

impl WorkingMemory {
    pub fn new() -> Self {
        Self {
            store: HashMap::new(),
        }
    }

    pub fn insert(&mut self, key: impl Into<String>, value: impl Into<String>) {
        self.store.insert(key.into(), value.into());
    }

    pub fn get(&self, key: &str) -> Option<&String> {
        self.store.get(key)
    }

    pub fn as_dict(&self) -> HashMap<String, String> {
        self.store.clone()
    }
}
