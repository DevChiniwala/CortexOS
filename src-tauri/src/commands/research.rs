use tauri::{AppHandle, State, ipc::Channel};
use crate::db::DbState;
use crate::db::queries;
use crate::db::schema::JobRow;
use crate::events;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResearchResult {
    pub job_id: String,
    pub status: String,
}

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StreamEvent {
    pub job_id: String,
    pub event_type: String,
    pub content: String,
    pub timestamp: i64,
}

#[tauri::command]
pub async fn start_research(
    lead_id: i64,
    custom_prompt: Option<String>,
    research_depth: Option<String>,
    on_event: Channel<StreamEvent>,
    app: AppHandle,
    db: State<'_, DbState>
) -> Result<ResearchResult, String> {
    let job_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    let job = JobRow {
        id: job_id.clone(),
        job_type: "company_research".to_string(),
        entity_id: lead_id,
        entity_label: format!("Lead {}", lead_id), // Better to fetch the name, but this is a stub
        status: "running".to_string(),
        prompt: custom_prompt.unwrap_or_else(|| "Default company research prompt".to_string()),
        model: Some("claude-3-5-sonnet-20240620".to_string()),
        working_dir: format!("/tmp/cortex/{}", job_id),
        output_path: None,
        exit_code: None,
        error_message: None,
        created_at: now,
        started_at: Some(now),
        completed_at: None,
        pid: None,
    };

    {
        let conn = db.conn.lock().map_err(|e| e.to_string())?;
        queries::insert_job(&conn, &job)?;
    }

    events::emit_job_created(&app, job_id.clone(), "company_research".to_string(), Some(lead_id));
    
    // Send a mock event for now
    let _ = on_event.send(StreamEvent {
        job_id: job_id.clone(),
        event_type: "system".to_string(),
        content: format!("Started research job {} at depth {:?}", job_id, research_depth),
        timestamp: chrono::Utc::now().timestamp_millis(),
    });

    Ok(ResearchResult {
        job_id,
        status: "started".to_string(),
    })
}

#[tauri::command]
pub async fn start_person_research(
    person_id: i64,
    custom_prompt: Option<String>,
    on_event: Channel<StreamEvent>,
    app: AppHandle,
    db: State<'_, DbState>
) -> Result<ResearchResult, String> {
    let job_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    let job = JobRow {
        id: job_id.clone(),
        job_type: "person_research".to_string(),
        entity_id: person_id,
        entity_label: format!("Person {}", person_id),
        status: "running".to_string(),
        prompt: custom_prompt.unwrap_or_else(|| "Default person research prompt".to_string()),
        model: Some("claude-3-5-sonnet-20240620".to_string()),
        working_dir: format!("/tmp/cortex/{}", job_id),
        output_path: None,
        exit_code: None,
        error_message: None,
        created_at: now,
        started_at: Some(now),
        completed_at: None,
        pid: None,
    };

    {
        let conn = db.conn.lock().map_err(|e| e.to_string())?;
        queries::insert_job(&conn, &job)?;
    }

    events::emit_job_created(&app, job_id.clone(), "person_research".to_string(), Some(person_id));

    let _ = on_event.send(StreamEvent {
        job_id: job_id.clone(),
        event_type: "system".to_string(),
        content: format!("Started person research job {}", job_id),
        timestamp: chrono::Utc::now().timestamp_millis(),
    });

    Ok(ResearchResult {
        job_id,
        status: "started".to_string(),
    })
}

#[tauri::command]
pub async fn start_scoring(
    lead_id: i64,
    on_event: Channel<StreamEvent>,
    app: AppHandle,
    db: State<'_, DbState>
) -> Result<ResearchResult, String> {
    let job_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    let job = JobRow {
        id: job_id.clone(),
        job_type: "scoring".to_string(),
        entity_id: lead_id,
        entity_label: format!("Lead {}", lead_id),
        status: "running".to_string(),
        prompt: "Default scoring prompt".to_string(),
        model: Some("claude-3-5-sonnet-20240620".to_string()),
        working_dir: format!("/tmp/cortex/{}", job_id),
        output_path: None,
        exit_code: None,
        error_message: None,
        created_at: now,
        started_at: Some(now),
        completed_at: None,
        pid: None,
    };

    {
        let conn = db.conn.lock().map_err(|e| e.to_string())?;
        queries::insert_job(&conn, &job)?;
    }

    events::emit_job_created(&app, job_id.clone(), "scoring".to_string(), Some(lead_id));

    let _ = on_event.send(StreamEvent {
        job_id: job_id.clone(),
        event_type: "system".to_string(),
        content: format!("Started scoring job {}", job_id),
        timestamp: chrono::Utc::now().timestamp_millis(),
    });

    Ok(ResearchResult {
        job_id,
        status: "started".to_string(),
    })
}

#[tauri::command]
pub async fn start_conversation_generation(
    person_id: i64,
    on_event: Channel<StreamEvent>,
    app: AppHandle,
    db: State<'_, DbState>
) -> Result<ResearchResult, String> {
    let job_id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    let job = JobRow {
        id: job_id.clone(),
        job_type: "conversation".to_string(),
        entity_id: person_id,
        entity_label: format!("Person {}", person_id),
        status: "running".to_string(),
        prompt: "Default conversation prompt".to_string(),
        model: Some("claude-3-5-sonnet-20240620".to_string()),
        working_dir: format!("/tmp/cortex/{}", job_id),
        output_path: None,
        exit_code: None,
        error_message: None,
        created_at: now,
        started_at: Some(now),
        completed_at: None,
        pid: None,
    };

    {
        let conn = db.conn.lock().map_err(|e| e.to_string())?;
        queries::insert_job(&conn, &job)?;
    }

    events::emit_job_created(&app, job_id.clone(), "conversation".to_string(), Some(person_id));

    let _ = on_event.send(StreamEvent {
        job_id: job_id.clone(),
        event_type: "system".to_string(),
        content: format!("Started conversation generation job {}", job_id),
        timestamp: chrono::Utc::now().timestamp_millis(),
    });

    Ok(ResearchResult {
        job_id,
        status: "started".to_string(),
    })
}
