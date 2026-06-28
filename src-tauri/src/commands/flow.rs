use tauri::AppHandle;
use crate::core::flow::{self, FlowPayload};

#[tauri::command]
pub async fn execute_flow(
    payload: FlowPayload,
    app: AppHandle,
) -> Result<(), String> {
    // Spawn in a background task so we don't block the UI thread during node execution
    tokio::spawn(async move {
        let _ = flow::execute_dag(app, payload).await;
    });
    
    Ok(())
}
