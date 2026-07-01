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

// ─── Gemini HTTP helpers ───────────────────────────────────────────

fn gemini_api_key() -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    dotenv::dotenv().ok();
    let key = env::var("GEMINI_API_KEY").unwrap_or_default();
    if key.is_empty() {
        return Err("Missing GEMINI_API_KEY in .env".into());
    }
    Ok(key)
}

/// Non-streaming Gemini call (for extraction). Returns the text content.
async fn gemini_generate(
    model: &str,
    system_prompt: &str,
    user_prompt: &str,
    json_mode: bool,
) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let api_key = gemini_api_key()?;
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        model, api_key
    );

    let mut generation_config = serde_json::json!({
        "temperature": 0.2,
        "maxOutputTokens": 4096,
    });

    if json_mode {
        generation_config["responseMimeType"] = serde_json::json!("application/json");
    }

    let body = serde_json::json!({
        "systemInstruction": {
            "parts": [{ "text": system_prompt }]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{ "text": user_prompt }]
            }
        ],
        "generationConfig": generation_config,
    });

    let client = reqwest::Client::new();
    let resp = client.post(&url)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await?;

    let status = resp.status();
    let text = resp.text().await?;

    if !status.is_success() {
        return Err(format!("Gemini API error ({}): {}", status, text).into());
    }

    let json: serde_json::Value = serde_json::from_str(&text)?;

    // Extract content from: candidates[0].content.parts[0].text
    let content = json["candidates"]
        .get(0)
        .and_then(|c| c["content"]["parts"].get(0))
        .and_then(|p| p["text"].as_str())
        .unwrap_or("")
        .to_string();

    Ok(content)
}

/// Streaming Gemini call (for synthesis). Emits tokens via Tauri events.
async fn gemini_stream(
    app: &AppHandle,
    model: &str,
    system_prompt: &str,
    user_prompt: &str,
) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let api_key = gemini_api_key()?;
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:streamGenerateContent?alt=sse&key={}",
        model, api_key
    );

    let body = serde_json::json!({
        "systemInstruction": {
            "parts": [{ "text": system_prompt }]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{ "text": user_prompt }]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 8192,
        },
    });

    let client = reqwest::Client::new();
    let resp = client.post(&url)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await?;
        return Err(format!("Gemini streaming error ({}): {}", status, text).into());
    }

    let mut full_response = String::new();
    let mut stream = resp.bytes_stream();
    let mut buffer = String::new();

    while let Some(chunk_result) = stream.next().await {
        let chunk_bytes = chunk_result?;
        let chunk_str = String::from_utf8_lossy(&chunk_bytes);
        buffer.push_str(&chunk_str);

        // Process complete SSE lines
        while let Some(line_end) = buffer.find('\n') {
            let line = buffer[..line_end].trim().to_string();
            buffer = buffer[line_end + 1..].to_string();

            if line.starts_with("data: ") {
                let json_str = &line[6..];
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(json_str) {
                    if let Some(text) = json["candidates"]
                        .get(0)
                        .and_then(|c| c["content"]["parts"].get(0))
                        .and_then(|p| p["text"].as_str())
                    {
                        full_response.push_str(text);
                        emit_log(app, "agent", text);
                    }
                }
            }
        }
    }

    Ok(full_response)
}

// ─── Public API (same signatures as before) ─────────────────────────

pub async fn stream_research(app: AppHandle, prompt: String) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    emit_log(&app, "system", "Connecting to Gemini...");
    emit_log(&app, "agent", "Thinking...");

    let result = gemini_stream(
        &app,
        "gemini-2.5-flash",
        "You are an autonomous B2B research agent. You are researching a target entity to generate actionable sales insights and a unified battlecard. Think step-by-step and explain your reasoning.",
        &prompt,
    ).await?;

    emit_log(&app, "result", "Research synthesis complete.");
    Ok(result)
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
    let api_key = gemini_api_key()?;

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={}",
        api_key
    );

    let body = serde_json::json!({
        "model": "models/text-embedding-004",
        "content": {
            "parts": [{ "text": text }]
        }
    });

    let client = reqwest::Client::new();
    let resp = client.post(&url)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await?;

    let status = resp.status();
    let text_resp = resp.text().await?;

    if !status.is_success() {
        return Err(format!("Gemini Embedding error ({}): {}", status, text_resp).into());
    }

    let json: serde_json::Value = serde_json::from_str(&text_resp)?;

    // Response shape: { "embedding": { "values": [0.1, 0.2, ...] } }
    let values = json["embedding"]["values"]
        .as_array()
        .ok_or("Gemini embedding response missing 'values' array")?;

    let embedding: Vec<f32> = values.iter()
        .filter_map(|v| v.as_f64().map(|f| f as f32))
        .collect();

    Ok(embedding)
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct PersonClaim {
    pub name: String,
    pub title: String,
    pub quote: String,       // must contain BOTH name and title
    pub source_url: String,
}

pub async fn extract_people(raw_content: &str, url: &str, company: &str) -> Result<Vec<PersonClaim>, Box<dyn std::error::Error + Send + Sync>> {
    let user_prompt = format!(
        "Extract every person mentioned by full name along with their job title at {}.\n\
        Return JSON: {{\"people\": [{{\"name\": \"...\", \"title\": \"...\", \
        \"quote\": \"verbatim text containing BOTH the name and title together\", \
        \"source_url\": \"{}\"}}]}}.\n\
        Only include people whose name AND title both appear explicitly in the text. \
        Do not infer a title from context. If none found, return {{\"people\": []}}.\n\nTEXT:\n{}",
        company, url, raw_content
    );

    let content = gemini_generate(
        "gemini-2.5-flash",
        "You are a JSON people/titles extractor. Return ONLY valid JSON.",
        &user_prompt,
        true,
    ).await?;

    #[derive(serde::Deserialize)]
    struct PeopleResponse { people: Vec<PersonClaim> }

    match serde_json::from_str::<PeopleResponse>(&content) {
        Ok(res) => Ok(res.people),
        Err(_) => match serde_json::from_str::<Vec<PersonClaim>>(&content) {
            Ok(people) => Ok(people),
            Err(_) => Ok(vec![]),
        },
    }
}

/// Reuses verify_claim's exact 3-tier gauntlet unchanged — just adapts the shape.
pub fn verify_person(person: &PersonClaim, raw_content: &str) -> VerificationResult {
    let as_claim = ExtractedClaim {
        claim: format!("{} — {}", person.name, person.title),
        quote: person.quote.clone(),
        source_url: person.source_url.clone(),
    };
    verify_claim(&as_claim, raw_content)
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct ExtractedClaim {
    pub claim: String,
    pub quote: String,
    pub source_url: String,
}

pub async fn extract_claims(raw_content: &str, url: &str, topic: &str) -> Result<Vec<ExtractedClaim>, Box<dyn std::error::Error + Send + Sync>> {
    let user_prompt = format!(
        "You are an extraction agent. Extract facts from the following text about: {}.\n\
        Return a JSON object with a single key 'claims' containing an array of objects, each with 'claim', 'quote' (must be an exact verbatim substring from the text), and 'source_url' (set to '{}').\n\
        If no relevant facts are found, return {{\"claims\": []}}.\n\nTEXT:\n{}",
        topic, url, raw_content
    );

    let content = gemini_generate(
        "gemini-2.5-flash",
        "You are a JSON fact extractor. Return ONLY valid JSON in this format: { \"claims\": [ { \"claim\": \"...\", \"quote\": \"...\", \"source_url\": \"...\" } ] }.",
        &user_prompt,
        true, // JSON mode
    ).await?;

    #[derive(serde::Deserialize)]
    struct ExtractionResponse {
        claims: Vec<ExtractedClaim>,
    }

    match serde_json::from_str::<ExtractionResponse>(&content) {
        Ok(res) => Ok(res.claims),
        Err(_) => {
            // Try to parse as a direct array
            match serde_json::from_str::<Vec<ExtractedClaim>>(&content) {
                Ok(claims) => Ok(claims),
                Err(_) => Ok(vec![]),
            }
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
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

/// Helper to extract contiguous numeric digits from a string to validate facts
fn extract_numbers(s: &str) -> Vec<String> {
    let mut numbers = Vec::new();
    let mut current = String::new();
    for c in s.chars() {
        if c.is_ascii_digit() {
            current.push(c);
        } else if !current.is_empty() {
            numbers.push(current.clone());
            current.clear();
        }
    }
    if !current.is_empty() {
        numbers.push(current);
    }
    numbers
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
            let mut best_window = String::new();

            let step = std::cmp::max(1, q_len / 10); // Don't check every single offset
            let mut i = 0;
            while i + q_len <= source_chars.len() {
                let end = std::cmp::min(i + window_size, source_chars.len());
                let window: String = source_chars[i..end].iter().collect();
                let ratio = lcs_ratio(&norm_quote, &window);
                if ratio > best_ratio {
                    best_ratio = ratio;
                    best_window = window;
                }
                if best_ratio >= 0.95 { break; } // Early exit on strong match
                i += step;
            }

            if best_ratio >= 0.80 {
                // Secondary check: verify numbers in the fuzzy match to prevent LCS hallucination
                // e.g. "20%" vs "200%" will have a high LCS but different numbers
                let quote_nums = extract_numbers(&norm_quote);
                let window_nums = extract_numbers(&best_window);
                let mut numbers_match = true;
                for num in &quote_nums {
                    if !window_nums.contains(num) {
                        numbers_match = false;
                        break;
                    }
                }
                
                if numbers_match {
                    return VerificationResult { passed: true, confidence: best_ratio, match_type: "fuzzy".to_string() };
                }
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
