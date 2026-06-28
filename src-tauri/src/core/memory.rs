use rusqlite::{params, Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct VectorMemory {
    pub id: i64,
    pub company_id: i64,
    pub text_content: String,
    pub embedding: Vec<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MemoryMatch {
    pub company_id: i64,
    pub text_content: String,
    pub similarity: f32,
}

/// Compute cosine similarity between two vectors
pub fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() {
        return 0.0;
    }
    
    let mut dot_product = 0.0;
    let mut norm_a = 0.0;
    let mut norm_b = 0.0;

    for i in 0..a.len() {
        dot_product += a[i] * b[i];
        norm_a += a[i] * a[i];
        norm_b += b[i] * b[i];
    }

    if norm_a == 0.0 || norm_b == 0.0 {
        return 0.0;
    }

    dot_product / (norm_a.sqrt() * norm_b.sqrt())
}

/// Store a new memory embedding
pub fn store_memory(conn: &Connection, company_id: i64, text_content: &str, embedding: &[f32]) -> SqlResult<()> {
    let embedding_json = serde_json::to_string(embedding).unwrap();
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    conn.execute(
        "INSERT INTO vector_embeddings (company_id, text_content, embedding, created_at)
         VALUES (?1, ?2, ?3, ?4)",
        params![company_id, text_content, embedding_json, now],
    )?;

    Ok(())
}

/// Search for the top K most similar memories to a query embedding
pub fn search_memories(conn: &Connection, query_embedding: &[f32], limit: usize) -> SqlResult<Vec<MemoryMatch>> {
    let mut stmt = conn.prepare("SELECT id, company_id, text_content, embedding FROM vector_embeddings")?;
    
    let memory_iter = stmt.query_map([], |row| {
        let embedding_str: String = row.get(3)?;
        let embedding: Vec<f32> = serde_json::from_str(&embedding_str).unwrap_or_default();
        
        Ok(VectorMemory {
            id: row.get(0)?,
            company_id: row.get(1)?,
            text_content: row.get(2)?,
            embedding,
        })
    })?;

    let mut matches = Vec::new();
    
    for memory_result in memory_iter {
        let memory = memory_result?;
        let similarity = cosine_similarity(query_embedding, &memory.embedding);
        
        matches.push(MemoryMatch {
            company_id: memory.company_id,
            text_content: memory.text_content,
            similarity,
        });
    }

    // Sort descending by similarity
    matches.sort_by(|a, b| b.similarity.partial_cmp(&a.similarity).unwrap_or(std::cmp::Ordering::Equal));
    
    // Take top K
    matches.truncate(limit);
    
    Ok(matches)
}
