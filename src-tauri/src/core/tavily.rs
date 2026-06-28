use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Serialize, Deserialize)]
pub struct TavilySearchRequest {
    pub api_key: String,
    pub query: String,
    pub search_depth: String, // "basic" or "advanced"
    pub include_answer: bool,
    pub include_raw_content: bool,
    pub max_results: u8,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TavilyResult {
    pub title: String,
    pub url: String,
    pub content: String,
    pub score: f32,
    pub raw_content: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TavilySearchResponse {
    pub query: String,
    pub results: Vec<TavilyResult>,
}

pub async fn search_web(query: &str, max_results: u8) -> Result<Vec<TavilyResult>, String> {
    dotenv::dotenv().ok();
    
    let api_key = env::var("TAVILY_API_KEY").map_err(|_| "TAVILY_API_KEY is not set in environment".to_string())?;
    
    let client = Client::new();
    let req_body = TavilySearchRequest {
        api_key,
        query: query.to_string(),
        search_depth: "basic".to_string(), // Keep it fast and cheap
        include_answer: false,
        include_raw_content: true, // We want the raw content for extraction
        max_results,
    };

    let res = client
        .post("https://api.tavily.com/search")
        .header("Content-Type", "application/json")
        .json(&req_body)
        .send()
        .await
        .map_err(|e| format!("Tavily HTTP error: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("Tavily API returned error: {}", res.status()));
    }

    let data: TavilySearchResponse = res.json().await.map_err(|e| format!("Failed to parse Tavily response: {}", e))?;
    
    Ok(data.results)
}
