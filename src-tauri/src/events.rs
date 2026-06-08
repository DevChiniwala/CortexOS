use serde::Serialize;
use tauri::{AppHandle, Emitter};

/// Cortex Nexus: Centralized Event System for IPC
/// Handles all real-time communication between the Rust core and the React frontend.

// ============================================================================
// Entity Events
// ============================================================================

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EntityUpdatedPayload {
    pub entity_type: String, // "agent", "memory", "signal", "flow"
    pub id: i64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EntityDeletedPayload {
    pub entity_type: String,
    pub ids: Vec<i64>,
}

pub fn emit_entity_updated(app: &AppHandle, entity_type: &str, id: i64) {
    let _ = app.emit(
        "nexus:entity-updated",
        EntityUpdatedPayload {
            entity_type: entity_type.to_string(),
            id,
        },
    );
}

pub fn emit_entity_deleted(app: &AppHandle, entity_type: &str, ids: Vec<i64>) {
    let _ = app.emit(
        "nexus:entity-deleted",
        EntityDeletedPayload {
            entity_type: entity_type.to_string(),
            ids,
        },
    );
}

// ============================================================================
// Job / Workflow Events
// ============================================================================

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JobStatusChangedPayload {
    pub job_id: String,
    pub status: String,
    pub exit_code: Option<i32>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JobLogsAppendedPayload {
    pub job_id: String,
    pub count: i64,
    pub last_sequence: i64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JobCreatedPayload {
    pub job_id: String,
    pub job_type: String,
    pub target_id: Option<i64>,
}

pub fn emit_job_status_changed(
    app: &AppHandle,
    job_id: String,
    status: String,
    exit_code: Option<i32>,
) {
    let _ = app.emit(
        "nexus:job-status-changed",
        JobStatusChangedPayload {
            job_id,
            status,
            exit_code,
        },
    );
}

pub fn emit_job_logs_appended(app: &AppHandle, job_id: String, count: i64, last_sequence: i64) {
    let _ = app.emit(
        "nexus:job-logs-appended",
        JobLogsAppendedPayload {
            job_id,
            count,
            last_sequence,
        },
    );
}

pub fn emit_job_created(
    app: &AppHandle,
    job_id: String,
    job_type: String,
    target_id: Option<i64>,
) {
    let _ = app.emit(
        "nexus:job-created",
        JobCreatedPayload {
            job_id,
            job_type,
            target_id,
        },
    );
}
