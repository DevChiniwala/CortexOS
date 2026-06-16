pub mod agent;
pub mod memory;

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use tauri::AppHandle;
use tokio::sync::mpsc;
use tokio::time::{sleep, Duration};
use tracing::{info, error, debug};
use rusqlite::Connection;

use crate::db::get_db_path;
use crate::db::queries;

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
    pub root_dir: PathBuf,
    pub session_id: String,
}

pub struct OrchestrationEngine {
    // We could store an MPSC channel sender here to push manual jobs
    pub tx: mpsc::Sender<String>,
}

impl OrchestrationEngine {
    pub fn new(tx: mpsc::Sender<String>) -> Self {
        Self { tx }
    }

    /// Prepares a fresh workspace directory for a new research job
    pub fn prepare_workspace(&self) -> Result<PreparedWorkspace, String> {
        let session_id = uuid::Uuid::new_v4().to_string();
        let root_dir = std::env::temp_dir().join(format!("cortexos-{}", session_id));
        std::fs::create_dir_all(&root_dir).map_err(|e| e.to_string())?;

        Ok(PreparedWorkspace {
            root_dir,
            session_id,
        })
    }
}

/// Starts the main orchestration background loop.
/// This runs independently of the Tauri UI threads.
pub fn start_orchestrator(app_handle: AppHandle) -> mpsc::Sender<String> {
    let (tx, mut rx) = mpsc::channel::<String>(100);

    let db_path = get_db_path();

    tokio::spawn(async move {
        info!("Orchestration Engine started");
        
        loop {
            // 1. Check for manual job triggers
            if let Ok(_job_id) = rx.try_recv() {
                // If we got a signal, we could immediately fetch it
                debug!("Received manual job trigger");
            }

            // 2. Open a local DB connection for this thread to avoid locking the UI connection
            match Connection::open(&db_path) {
                Ok(conn) => {
                    // Try to fetch queued jobs
                    match queries::get_jobs_by_status(&conn, "queued", 5) {
                        Ok(jobs) => {
                            for mut job in jobs {
                                info!("Starting job: {} ({})", job.id, job.job_type);
                                
                                // Mark as running
                                if let Err(e) = queries::update_job_status(&conn, &job.id, "running", None) {
                                    error!("Failed to update job status: {}", e);
                                    continue;
                                }

                                // Here we would actually spawn the Agent worker tasks
                                // For Day 25, we just simulate work
                                tokio::spawn(async move {
                                    // Simulate work
                                    sleep(Duration::from_secs(3)).await;
                                    
                                    // In a real system we would use the worker connection to update status
                                    let thread_conn = Connection::open(get_db_path()).unwrap();
                                    let _ = queries::update_job_status(&thread_conn, &job.id, "completed", Some(0));
                                    info!("Completed job: {}", job.id);
                                });
                            }
                        }
                        Err(e) => {
                            error!("Failed to query jobs: {}", e);
                        }
                    }
                }
                Err(e) => {
                    error!("Orchestrator failed to open DB: {}", e);
                }
            }

            // 3. Sleep before next poll
            sleep(Duration::from_secs(5)).await;
        }
    });

    tx
}
