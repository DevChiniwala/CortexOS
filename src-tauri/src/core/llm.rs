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

#[derive(Debug, Clone, serde::Serialize)]
pub struct VerificationResult {
    pub passed: bool,
    pub confidence: f32,    // 1.0 = exact match, 0.85+ = near match
    pub match_type: String, // "exact", "normalized", "fuzzy", "failed"
}

/// Normalize text for comparison: collapse whitespace, normalize quotes,
/// dashes, and other characters LLMs commonly alter when re-typing quotes.
fn normalize_for_comparison(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut last_was_space = false;

    for c in s.chars() {
        let normalized = match c {
            // Smart quotes → straight quotes
            '\u{2018}' | '\u{2019}' | '\u{201A}' | '\u{2039}' | '\u{203A}' => '\'',
            '\u{201C}' | '\u{201D}' | '\u{201E}' | '\u{00AB}' | '\u{00BB}' => '"',
            // Em/en dashes → hyphen
            '\u{2013}' | '\u{2014}' | '\u{2012}' => '-',
            // Ellipsis → three dots
            '\u{2026}' => '.',
            // Non-breaking space → regular space
            '\u{00A0}' => ' ',
            other => other,
        };

        if normalized.is_whitespace() {
            if !last_was_space {
                result.push(' ');
                last_was_space = true;
            }
        } else {
            result.push(normalized.to_lowercase().next().unwrap_or(normalized));
            last_was_space = false;
        }
    }

    result.trim().to_string()
}

/// Hardened claim verifier that handles near-exact quotes.
/// Three-tier matching:
///   1. Exact substring match → confidence 1.0
///   2. Normalized match (after collapsing whitespace/quotes/dashes) → confidence 0.92
///   3. Fuzzy match (longest common subsequence ratio) → confidence = LCS ratio if >= 0.80
pub fn verify_claim(claim: &ExtractedClaim, raw_content: &str) -> VerificationResult {
    if claim.quote.is_empty() || claim.quote.len() < 10 {
        return VerificationResult { passed: false, confidence: 0.0, match_type: "failed".to_string() };
    }

    // Tier 1: Exact match
    if raw_content.contains(&claim.quote) {
        return VerificationResult { passed: true, confidence: 1.0, match_type: "exact".to_string() };
    }

    // Tier 2: Normalized match
    let norm_quote = normalize_for_comparison(&claim.quote);
    let norm_source = normalize_for_comparison(raw_content);

    if norm_source.contains(&norm_quote) {
        return VerificationResult { passed: true, confidence: 0.92, match_type: "normalized".to_string() };
    }

    // Tier 3: Fuzzy match — sliding window LCS ratio over the source
    // Only attempt this for quotes under 500 chars to avoid O(n*m) blowup
    if norm_quote.len() < 500 {
        let quote_chars: Vec<char> = norm_quote.chars().collect();
        let source_chars: Vec<char> = norm_source.chars().collect();
        let q_len = quote_chars.len();

        if q_len > 0 && source_chars.len() >= q_len {
            let window_size = (q_len as f32 * 1.3) as usize; // Allow 30% larger window
            let mut best_ratio: f32 = 0.0;

            let step = std::cmp::max(1, q_len / 10); // Don't check every single offset
            let mut i = 0;
            while i + q_len <= source_chars.len() {
                let end = std::cmp::min(i + window_size, source_chars.len());
                let window: String = source_chars[i..end].iter().collect();
                let ratio = lcs_ratio(&norm_quote, &window);
                if ratio > best_ratio {
                    best_ratio = ratio;
                }
                if best_ratio >= 0.95 { break; } // Early exit on strong match
                i += step;
            }

            if best_ratio >= 0.80 {
                return VerificationResult { passed: true, confidence: best_ratio, match_type: "fuzzy".to_string() };
            }
        }
    }

    VerificationResult { passed: false, confidence: 0.0, match_type: "failed".to_string() }
}

/// Longest Common Subsequence ratio between two strings.
/// Returns a value between 0.0 and 1.0.
fn lcs_ratio(a: &str, b: &str) -> f32 {
    let a_chars: Vec<char> = a.chars().collect();
    let b_chars: Vec<char> = b.chars().collect();
    let m = a_chars.len();
    let n = b_chars.len();

    if m == 0 || n == 0 { return 0.0; }

    // Space-optimized LCS using two rows
    let mut prev = vec![0u32; n + 1];
    let mut curr = vec![0u32; n + 1];

    for i in 1..=m {
        for j in 1..=n {
            if a_chars[i - 1] == b_chars[j - 1] {
                curr[j] = prev[j - 1] + 1;
            } else {
                curr[j] = std::cmp::max(prev[j], curr[j - 1]);
            }
        }
        std::mem::swap(&mut prev, &mut curr);
        curr.iter_mut().for_each(|x| *x = 0);
    }

    let lcs_len = prev[n] as f32;
    lcs_len / m as f32
}

