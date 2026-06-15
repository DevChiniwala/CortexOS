pub mod jobs;
pub mod research;

use tauri::{AppHandle, State};
use crate::db::DbState;
use crate::db::queries;
use crate::db::schema::*;
use crate::events;

// ============================================================================
// Company (Lead) Commands
// ============================================================================

#[tauri::command]
pub async fn get_all_leads(db: State<'_, DbState>) -> Result<Vec<Lead>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_all_leads(&conn)
}

#[tauri::command]
pub async fn get_lead(id: i64, db: State<'_, DbState>) -> Result<Option<Lead>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_lead(&conn, id)
}

#[tauri::command]
pub async fn get_leads_with_scores(db: State<'_, DbState>) -> Result<Vec<Lead>, String> {
    // For now, return all leads (scoring join is added later when scoring is fully implemented)
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_all_leads(&conn)
}

#[tauri::command]
pub async fn get_unscored_leads(db: State<'_, DbState>) -> Result<Vec<Lead>, String> {
    // Return all leads that don't have a score yet
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_all_leads(&conn)
}

#[tauri::command]
pub async fn get_adjacent_leads(current_id: i64, db: State<'_, DbState>) -> Result<AdjacentResult, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_adjacent_leads(&conn, current_id)
}

#[tauri::command]
pub async fn insert_lead(data: NewLead, app: AppHandle, db: State<'_, DbState>) -> Result<i64, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let id = queries::insert_lead(&conn, &data)?;
    events::emit_entity_updated(&app, "leads", id);
    Ok(id)
}

#[tauri::command]
pub async fn update_lead_user_status(lead_id: i64, status: String, app: AppHandle, db: State<'_, DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::update_lead_user_status(&conn, lead_id, &status)?;
    events::emit_entity_updated(&app, "leads", lead_id);
    Ok(())
}

#[tauri::command]
pub async fn delete_leads(lead_ids: Vec<i64>, app: AppHandle, db: State<'_, DbState>) -> Result<usize, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let count = queries::delete_leads(&conn, &lead_ids)?;
    events::emit_entity_deleted(&app, "leads", lead_ids);
    Ok(count)
}

// ============================================================================
// People (Contact) Commands
// ============================================================================

#[tauri::command]
pub async fn get_all_people(db: State<'_, DbState>) -> Result<Vec<PersonWithCompany>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_all_people(&conn)
}

#[tauri::command]
pub async fn get_person(id: i64, db: State<'_, DbState>) -> Result<Option<PersonWithCompany>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_person(&conn, id)
}

#[tauri::command]
pub async fn get_people_for_lead(lead_id: i64, db: State<'_, DbState>) -> Result<Vec<Person>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_people_for_lead(&conn, lead_id)
}

#[tauri::command]
pub async fn get_adjacent_people(current_id: i64, db: State<'_, DbState>) -> Result<AdjacentResult, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_adjacent_people(&conn, current_id)
}

#[tauri::command]
pub async fn insert_person(data: NewPerson, app: AppHandle, db: State<'_, DbState>) -> Result<i64, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let id = queries::insert_person(&conn, &data)?;
    events::emit_entity_updated(&app, "people", id);
    Ok(id)
}

#[tauri::command]
pub async fn update_person_user_status(person_id: i64, status: String, app: AppHandle, db: State<'_, DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::update_person_user_status(&conn, person_id, &status)?;
    events::emit_entity_updated(&app, "people", person_id);
    Ok(())
}

#[tauri::command]
pub async fn delete_people(person_ids: Vec<i64>, app: AppHandle, db: State<'_, DbState>) -> Result<usize, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let count = queries::delete_people(&conn, &person_ids)?;
    events::emit_entity_deleted(&app, "people", person_ids);
    Ok(count)
}

// ============================================================================
// Settings Commands
// ============================================================================

#[tauri::command]
pub async fn get_settings(db: State<'_, DbState>) -> Result<Settings, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_settings(&conn)
}

#[tauri::command]
pub async fn update_settings(use_chrome: bool, db: State<'_, DbState>) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::update_settings_chrome(&conn, use_chrome)
}

#[tauri::command]
pub async fn update_orchestration_settings(
    orchestration_enabled: bool,
    default_research_depth: String,
    apollo_enabled: bool,
    apollo_max_contacts: i64,
    deep_job_concurrency: i64,
    daily_budget_usd_cents: Option<i64>,
    db: State<'_, DbState>,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::update_orchestration_settings(
        &conn,
        orchestration_enabled,
        &default_research_depth,
        apollo_enabled,
        apollo_max_contacts,
        deep_job_concurrency,
        daily_budget_usd_cents,
    )
}

// ============================================================================
// Prompt Commands
// ============================================================================

#[tauri::command]
pub async fn get_prompt_by_type(prompt_type: String, db: State<'_, DbState>) -> Result<Option<PromptRow>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_prompt_by_type(&conn, &prompt_type)
}

#[tauri::command]
pub async fn save_prompt_by_type(prompt_type: String, content: String, db: State<'_, DbState>) -> Result<i64, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::save_prompt_by_type(&conn, &prompt_type, &content)
}

// ============================================================================
// Scoring Commands
// ============================================================================

#[tauri::command]
pub async fn get_active_scoring_config(db: State<'_, DbState>) -> Result<Option<ScoringConfigRow>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_active_scoring_config(&conn)
}

#[tauri::command]
pub async fn get_lead_score(lead_id: i64, db: State<'_, DbState>) -> Result<Option<CompanyScoreRow>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_lead_score(&conn, lead_id)
}

// ============================================================================
// Onboarding Commands
// ============================================================================

#[tauri::command]
pub async fn get_onboarding_status(db: State<'_, DbState>) -> Result<OnboardingStatus, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_onboarding_status(&conn)
}

// ============================================================================
// Apollo (stub)
// ============================================================================

#[tauri::command]
pub async fn get_apollo_key_status() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "configured": false,
        "source": "none",
        "last4": null,
        "keyLength": null
    }))
}

// ============================================================================
// Handler Registration
// ============================================================================

pub fn generate_handlers() -> impl Fn(tauri::ipc::Invoke) -> bool {
    tauri::generate_handler![
        // Leads
        get_all_leads,
        get_lead,
        get_leads_with_scores,
        get_unscored_leads,
        get_adjacent_leads,
        insert_lead,
        update_lead_user_status,
        delete_leads,
        // People
        get_all_people,
        get_person,
        get_people_for_lead,
        get_adjacent_people,
        insert_person,
        update_person_user_status,
        delete_people,
        // Settings
        get_settings,
        update_settings,
        update_orchestration_settings,
        // Prompts
        get_prompt_by_type,
        save_prompt_by_type,
        // Scoring
        get_active_scoring_config,
        get_lead_score,
        // Onboarding
        get_onboarding_status,
        // Apollo
        get_apollo_key_status,
        // Jobs (from submodule)
        jobs::get_jobs_active,
        jobs::get_jobs_recent,
        jobs::get_job_by_id,
        jobs::get_job_logs_cmd,
        jobs::kill_job,
        // Research (from submodule)
        research::start_research,
        research::start_person_research,
        research::start_scoring,
        research::start_conversation_generation,
    ]
}
