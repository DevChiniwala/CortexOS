use serde::{Deserialize, Serialize};

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
pub struct Settings {
    pub use_chrome: bool,
    pub orchestration_enabled: bool,
    pub default_research_depth: String,
    pub deep_job_concurrency: i64,
    pub updated_at: i64,
}
