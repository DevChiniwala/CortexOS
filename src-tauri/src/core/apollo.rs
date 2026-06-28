use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Serialize, Deserialize)]
pub struct ApolloCompany {
    pub name: String,
    pub website_url: Option<String>,
    pub linkedin_url: Option<String>,
    pub primary_domain: Option<String>,
    pub short_description: Option<String>,
    pub estimated_num_employees: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApolloSearchResponse {
    pub organizations: Vec<ApolloCompany>,
}

pub async fn search_companies(query: &str) -> Result<Vec<ApolloCompany>, String> {
    dotenv::dotenv().ok();
    
    let api_key = env::var("APOLLO_API_KEY").map_err(|_| "APOLLO_API_KEY is not set in environment".to_string())?;
    
    let client = Client::new();
    let res = client
        .post("https://api.apollo.io/api/v1/mixed_companies/search")
        .header("Cache-Control", "no-cache")
        .header("Content-Type", "application/json")
        .header("api-key", api_key)
        .json(&serde_json::json!({
            "q_organization_name": query,
            "page": 1,
            "per_page": 10
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err(format!("Apollo API returned error: {}", res.status()));
    }

    let data: ApolloSearchResponse = res.json().await.map_err(|e| e.to_string())?;
    Ok(data.organizations)
}
