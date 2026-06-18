use rusqlite::Connection;
use tokio::time::{sleep, Duration};
use tracing::{info, error};

use crate::db::get_db_path;

pub fn start_verification_daemon() {
    let db_path = get_db_path();

    tokio::spawn(async move {
        info!("Data Integrity Verification Daemon started");

        loop {
            // Run every 24 hours (for testing, we'll use 60 seconds)
            sleep(Duration::from_secs(60)).await;

            match Connection::open(&db_path) {
                Ok(conn) => {
                    info!("Running data verification sweep...");
                    
                    // In a real implementation we would fetch stale leads/people
                    // e.g. "SELECT id FROM leads WHERE researched_at < ? OR researched_at IS NULL LIMIT 10"
                    
                    // For now, we simulate finding a stale record and queuing a job
                    // let's assume we found one
                    let simulated_lead_id = 1;
                    
                    let job_id = uuid::Uuid::new_v4().to_string();
                    let prompt = format!("Verify company data for Lead ID {}", simulated_lead_id);
                    
                    let _ = conn.execute(
                        "INSERT INTO jobs (id, job_type, entity_id, entity_label, status, prompt, created_at)
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                        rusqlite::params![
                            job_id,
                            "verify_data",
                            simulated_lead_id,
                            "company",
                            "queued",
                            prompt,
                            chrono::Utc::now().timestamp_millis()
                        ]
                    );

                    info!("Queued verification job: {}", job_id);
                }
                Err(e) => {
                    error!("Verification daemon failed to open DB: {}", e);
                }
            }
        }
    });
}
