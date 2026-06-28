use async_openai::{
    types::{CreateChatCompletionRequestArgs, ChatCompletionRequestSystemMessageArgs, ChatCompletionRequestUserMessageArgs, CreateEmbeddingRequestArgs},
    Client,
};
use futures::StreamExt;
use tauri::{AppHandle, Emitter};
use std::env;

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LogEntry {
    #[serde(rename = "type")]
    pub log_type: String,
    pub content: String,
    pub timestamp: i64,
    pub tool_name: Option<String>,
}

pub async fn stream_research(app: AppHandle, prompt: String) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    dotenv::dotenv().ok();
    
    let api_key = env::var("OPENAI_API_KEY").unwrap_or_default();
    if api_key.is_empty() {
        emit_log(&app, "error", "OPENAI_API_KEY is not set in environment.");
        return Err("Missing OPENAI_API_KEY".into());
    }

    let client = Client::new();

    let request = CreateChatCompletionRequestArgs::default()
        .model("gpt-4o")
        .max_tokens(1024_u32)
        .messages([
            ChatCompletionRequestSystemMessageArgs::default()
                .content("You are an autonomous B2B research agent. You are researching a target entity to generate actionable sales insights and a unified battlecard. Think step-by-step and explain your reasoning.")
                .build()?
                .into(),
            ChatCompletionRequestUserMessageArgs::default()
                .content(prompt)
                .build()?
                .into(),
        ])
        .build()?;

    emit_log(&app, "system", "Connecting to OpenAI...");

    let mut stream = client.chat().create_stream(request).await?;
    let mut full_response = String::new();

    emit_log(&app, "agent", "Thinking...");

    while let Some(result) = stream.next().await {
        match result {
            Ok(response) => {
                for choice in response.choices {
                    if let Some(content) = choice.delta.content {
                        full_response.push_str(&content);
                        // Emit token stream
                        emit_log(&app, "agent", &content);
                    }
                }
            }
            Err(err) => {
                emit_log(&app, "error", &format!("Stream error: {}", err));
            }
        }
    }

    emit_log(&app, "result", "Research synthesis complete.");

    Ok(full_response)
}

fn emit_log(app: &AppHandle, log_type: &str, content: &str) {
    let _ = app.emit("stream_event", LogEntry {
        log_type: log_type.to_string(),
        content: content.to_string(),
        timestamp: chrono::Utc::now().timestamp_millis(),
        tool_name: None,
    });
}

pub async fn generate_embedding(text: &str) -> Result<Vec<f32>, Box<dyn std::error::Error + Send + Sync>> {
    dotenv::dotenv().ok();
    
    let api_key = env::var("OPENAI_API_KEY").unwrap_or_default();
    if api_key.is_empty() {
        return Err("Missing OPENAI_API_KEY".into());
    }

    let client = Client::new();
    let request = CreateEmbeddingRequestArgs::default()
        .model("text-embedding-3-small")
        .input([text])
        .build()?;
        
    let response = client.embeddings().create(request).await?;
    
    if let Some(data) = response.data.first() {
        Ok(data.embedding.clone())
    } else {
        Err("No embedding returned".into())
    }
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct ExtractedClaim {
    pub claim: String,
    pub quote: String,
    pub source_url: String,
}

pub async fn extract_claims(raw_content: &str, url: &str, topic: &str) -> Result<Vec<ExtractedClaim>, Box<dyn std::error::Error + Send + Sync>> {
    dotenv::dotenv().ok();
    
    let api_key = env::var("OPENAI_API_KEY").unwrap_or_default();
    if api_key.is_empty() {
        return Err("Missing OPENAI_API_KEY".into());
    }

    let client = Client::new();
    let prompt = format!(
        "You are an extraction agent. Extract facts from the following text about: {}.\n\
        Return a JSON array of objects with 'claim', 'quote' (must be an exact verbatim substring), and 'source_url' (set to '{}').\n\
        If no relevant facts are found, return [].\n\nTEXT:\n{}",
        topic, url, raw_content
    );

    let request = CreateChatCompletionRequestArgs::default()
        .model("gpt-4o-mini") // Cheaper and faster for extraction
        .response_format(serde_json::json!({ "type": "json_object" }))
        .messages([
            ChatCompletionRequestSystemMessageArgs::default()
                .content("You are a JSON fact extractor. Return ONLY valid JSON in this format: { \"claims\": [ { \"claim\": \"...\", \"quote\": \"...\", \"source_url\": \"...\" } ] }.")
                .build()?
                .into(),
            ChatCompletionRequestUserMessageArgs::default()
                .content(prompt)
                .build()?
                .into(),
        ])
        .build()?;

    let response = client.chat().create(request).await?;
    
    if let Some(choice) = response.choices.first() {
        if let Some(content) = &choice.message.content {
            #[derive(serde::Deserialize)]
            struct ExtractionResponse {
                claims: Vec<ExtractedClaim>,
            }
            let res: ExtractionResponse = serde_json::from_str(content)?;
            return Ok(res.claims);
        }
    }
    
    Ok(vec![])
}

pub fn verify_claim(claim: &ExtractedClaim, raw_content: &str) -> bool {
    if claim.quote.is_empty() {
        return false;
    }
    // Pure Rust string matching for zero-hallucination verification
    raw_content.contains(&claim.quote)
}
