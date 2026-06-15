use tauri::{AppHandle, State};
use crate::db::DbState;
use crate::db::queries;
use crate::db::schema::{JobRow, JobLogRow};
use crate::events;

#[tauri::command]
pub async fn get_jobs_active(db: State<'_, DbState>) -> Result<Vec<JobRow>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_jobs_active(&conn)
}

#[tauri::command]
pub async fn get_jobs_recent(limit: Option<i64>, db: State<'_, DbState>) -> Result<Vec<JobRow>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_jobs_recent(&conn, limit.unwrap_or(50))
}

#[tauri::command]
pub async fn get_job_by_id(job_id: String, db: State<'_, DbState>) -> Result<Option<JobRow>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_job_by_id(&conn, &job_id)
}

#[tauri::command]
pub async fn get_job_logs_cmd(
    job_id: String,
    after_sequence: Option<i64>,
    limit: Option<i64>,
    db: State<'_, DbState>
) -> Result<Vec<JobLogRow>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_job_logs(&conn, &job_id, after_sequence, limit)
}

#[tauri::command]
pub async fn kill_job(job_id: String, app: AppHandle, db: State<'_, DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::update_job_status(&conn, &job_id, "cancelled", Some(-1))?;
    events::emit_job_status_changed(&app, job_id, "cancelled".to_string(), Some(-1));
    // In a real system, we'd also send a cancellation token to the worker thread here
    Ok(())
}
