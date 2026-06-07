pub mod schema;

use rusqlite::{Connection, Result as SqliteResult};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

pub use schema::*;

pub struct DbState {
    pub conn: Arc<Mutex<Connection>>,
}

impl DbState {
    pub fn new(db_path: PathBuf) -> SqliteResult<Self> {
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).ok();
        }

        let conn = Connection::open(&db_path)?;
        conn.pragma_update(None, "journal_mode", "WAL")?;
        conn.pragma_update(None, "foreign_keys", "ON")?;

        init_schema(&conn)?;

        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
        })
    }
}

fn init_schema(conn: &Connection) -> SqliteResult<()> {
    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name TEXT NOT NULL,
            website TEXT,
            industry TEXT,
            sub_industry TEXT,
            employees INTEGER,
            employee_range TEXT,
            revenue REAL,
            revenue_range TEXT,
            company_linkedin_url TEXT,
            city TEXT,
            state TEXT,
            country TEXT,
            research_status TEXT DEFAULT 'pending',
            researched_at INTEGER,
            user_status TEXT DEFAULT 'new',
            created_at INTEGER NOT NULL,
            company_profile TEXT
        );

        CREATE TABLE IF NOT EXISTS people (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT,
            title TEXT,
            management_level TEXT,
            linkedin_url TEXT,
            person_profile TEXT,
            research_status TEXT DEFAULT 'pending',
            researched_at INTEGER,
            user_status TEXT DEFAULT 'new',
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL,
            entity_id INTEGER NOT NULL,
            fact_key TEXT NOT NULL,
            fact_value TEXT NOT NULL,
            confidence REAL NOT NULL DEFAULT 1.0,
            source_url TEXT,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            use_chrome INTEGER NOT NULL DEFAULT 0,
            orchestration_enabled INTEGER NOT NULL DEFAULT 1,
            default_research_depth TEXT NOT NULL DEFAULT 'light',
            deep_job_concurrency INTEGER NOT NULL DEFAULT 1,
            updated_at INTEGER NOT NULL
        );

        INSERT OR IGNORE INTO settings (
            id, use_chrome, orchestration_enabled, default_research_depth,
            deep_job_concurrency, updated_at
        )
        VALUES (1, 0, 1, 'light', 1, strftime('%s', 'now') * 1000);

        CREATE INDEX IF NOT EXISTS idx_people_lead_id ON people(lead_id);
        CREATE INDEX IF NOT EXISTS idx_memory_entity ON memory(entity_type, entity_id);
        "#,
    )?;

    Ok(())
}

pub fn get_db_path() -> PathBuf {
    let data_dir = dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("cortex-os");

    data_dir.join("data.db")
}
