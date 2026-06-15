use serde::{Deserialize, Serialize};

// ============================================================================
// Lead (Company)
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Lead {
    pub id: i64,
    pub company_name: String,
    pub website: Option<String>,
    pub industry: Option<String>,
    pub sub_industry: Option<String>,
    pub employees: Option<i64>,
    pub employee_range: Option<String>,
    pub revenue: Option<f64>,
    pub revenue_range: Option<String>,
    pub company_linkedin_url: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub country: Option<String>,
    pub research_status: String,
    pub researched_at: Option<i64>,
    pub user_status: String,
    pub created_at: i64,
    pub company_profile: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewLead {
    pub company_name: String,
    pub website: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub country: Option<String>,
}

// ============================================================================
// Person (Contact)
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Person {
    pub id: i64,
    pub lead_id: Option<i64>,
    pub first_name: String,
    pub last_name: String,
    pub email: Option<String>,
    pub title: Option<String>,
    pub management_level: Option<String>,
    pub linkedin_url: Option<String>,
    pub person_profile: Option<String>,
    pub research_status: String,
    pub researched_at: Option<i64>,
    pub user_status: String,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonWithCompany {
    pub id: i64,
    pub lead_id: Option<i64>,
    pub first_name: String,
    pub last_name: String,
    pub email: Option<String>,
    pub title: Option<String>,
    pub management_level: Option<String>,
    pub linkedin_url: Option<String>,
    pub person_profile: Option<String>,
    pub research_status: String,
    pub researched_at: Option<i64>,
    pub user_status: String,
    pub created_at: i64,
    // Joined fields
    pub company_name: Option<String>,
    pub company_website: Option<String>,
    pub company_industry: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewPerson {
    pub first_name: String,
    pub last_name: String,
    pub email: Option<String>,
    pub title: Option<String>,
    pub linkedin_url: Option<String>,
    pub company_id: Option<i64>,
}

// ============================================================================
// Settings
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub use_chrome: bool,
    pub orchestration_enabled: bool,
    pub default_research_depth: String,
    pub apollo_enabled: bool,
    pub apollo_max_contacts: i64,
    pub deep_job_concurrency: i64,
    pub daily_budget_usd_cents: Option<i64>,
    pub updated_at: i64,
}

// ============================================================================
// Signal
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SignalRow {
    pub id: i64,
    pub lead_id: i64,
    pub signal_type: String,
    pub title: String,
    pub description: String,
    pub confidence: f64,
    pub source: String,
    pub detected_at: i64,
}

// ============================================================================
// Job
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JobRow {
    pub id: String,
    pub job_type: String,
    pub entity_id: i64,
    pub entity_label: String,
    pub status: String,
    pub prompt: String,
    pub model: Option<String>,
    pub working_dir: String,
    pub output_path: Option<String>,
    pub exit_code: Option<i32>,
    pub error_message: Option<String>,
    pub created_at: i64,
    pub started_at: Option<i64>,
    pub completed_at: Option<i64>,
    pub pid: Option<i64>,
}

// ============================================================================
// Job Log
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JobLogRow {
    pub id: i64,
    pub job_id: String,
    pub log_type: String,
    pub content: String,
    pub tool_name: Option<String>,
    pub timestamp: i64,
    pub sequence: i64,
    pub source: String,
}

// ============================================================================
// Prompt
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PromptRow {
    pub id: i64,
    pub prompt_type: String,
    pub content: String,
    pub created_at: i64,
    pub updated_at: i64,
}

// ============================================================================
// Scoring Config
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScoringConfigRow {
    pub id: i64,
    pub name: String,
    pub is_active: bool,
    pub required_characteristics: String, // JSON blob
    pub demand_signifiers: String,        // JSON blob
    pub tier_hot_min: f64,
    pub tier_warm_min: f64,
    pub tier_nurture_min: f64,
    pub created_at: i64,
    pub updated_at: i64,
}

// ============================================================================
// Company Score
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompanyScoreRow {
    pub id: i64,
    pub lead_id: i64,
    pub config_id: i64,
    pub passes_requirements: bool,
    pub requirement_results: String, // JSON blob
    pub total_score: f64,
    pub score_breakdown: String, // JSON blob
    pub tier: String,
    pub scoring_notes: Option<String>,
    pub scored_at: Option<i64>,
    pub created_at: i64,
}

// ============================================================================
// Onboarding Status
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OnboardingStatus {
    pub has_company_overview: bool,
    pub has_lead: bool,
    pub has_researched_lead: bool,
    pub has_scored_lead: bool,
    pub has_researched_person: bool,
    pub has_conversation_topics: bool,
}

// ============================================================================
// Adjacent Result
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdjacentResult {
    pub prev_lead: Option<i64>,
    pub next_lead: Option<i64>,
    pub current_index: i64,
    pub total: i64,
}
