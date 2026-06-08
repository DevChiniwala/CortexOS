use tauri::State;
use crate::db::DbState;
use crate::orchestration::ResearchDepth;

#[tauri::command]
pub async fn get_all_leads(_db: State<'_, DbState>) -> Result<Vec<serde_json::Value>, String> {
    // Return empty list as a placeholder for now
    Ok(Vec::new())
}

#[tauri::command]
pub async fn get_lead(_id: i64, _db: State<'_, DbState>) -> Result<Option<serde_json::Value>, String> {
    Ok(None)
}

#[tauri::command]
pub async fn get_leads_with_scores(_db: State<'_, DbState>) -> Result<Vec<serde_json::Value>, String> {
    Ok(Vec::new())
}

#[tauri::command]
pub async fn get_unscored_leads(_db: State<'_, DbState>) -> Result<Vec<serde_json::Value>, String> {
    Ok(Vec::new())
}

#[tauri::command]
pub async fn get_all_people(_db: State<'_, DbState>) -> Result<Vec<serde_json::Value>, String> {
    Ok(Vec::new())
}

#[tauri::command]
pub async fn get_person(_id: i64, _db: State<'_, DbState>) -> Result<Option<serde_json::Value>, String> {
    Ok(None)
}

#[tauri::command]
pub async fn get_people_for_lead(_lead_id: i64, _db: State<'_, DbState>) -> Result<Vec<serde_json::Value>, String> {
    Ok(Vec::new())
}

#[tauri::command]
pub async fn get_settings(_db: State<'_, DbState>) -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "useChrome": false,
        "orchestrationEnabled": false,
        "defaultResearchDepth": "light",
        "apolloEnabled": false,
        "apolloMaxContacts": 10,
        "deepJobConcurrency": 1,
        "dailyBudgetUsdCents": null,
        "updatedAt": 0,
    }))
}

pub fn generate_handlers() -> impl Fn(tauri::ipc::Invoke) -> bool {
    tauri::generate_handler![
        get_all_leads,
        get_lead,
        get_leads_with_scores,
        get_unscored_leads,
        get_all_people,
        get_person,
        get_people_for_lead,
        get_settings,
    ]
}
