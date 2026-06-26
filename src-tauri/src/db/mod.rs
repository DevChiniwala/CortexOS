pub mod queries;
pub mod schema;

use rusqlite::{Connection, Result as SqliteResult};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

pub use schema::*;

#[derive(Clone)]
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

        CREATE TABLE IF NOT EXISTS signals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
            signal_type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            confidence REAL NOT NULL DEFAULT 0.5,
            source TEXT NOT NULL DEFAULT 'unknown',
            detected_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            job_type TEXT NOT NULL,
            entity_id INTEGER NOT NULL,
            entity_label TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'queued',
            prompt TEXT NOT NULL DEFAULT '',
            model TEXT,
            working_dir TEXT NOT NULL DEFAULT '',
            output_path TEXT,
            exit_code INTEGER,
            error_message TEXT,
            created_at INTEGER NOT NULL,
            started_at INTEGER,
            completed_at INTEGER,
            pid INTEGER
        );

        CREATE TABLE IF NOT EXISTS job_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
            log_type TEXT NOT NULL DEFAULT 'info',
            content TEXT NOT NULL DEFAULT '',
            tool_name TEXT,
            timestamp INTEGER NOT NULL,
            sequence INTEGER NOT NULL DEFAULT 0,
            source TEXT NOT NULL DEFAULT 'internal'
        );

        CREATE TABLE IF NOT EXISTS scoring_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 0,
            required_characteristics TEXT NOT NULL DEFAULT '[]',
            demand_signifiers TEXT NOT NULL DEFAULT '[]',
            tier_hot_min REAL NOT NULL DEFAULT 80.0,
            tier_warm_min REAL NOT NULL DEFAULT 50.0,
            tier_nurture_min REAL NOT NULL DEFAULT 20.0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS company_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
            config_id INTEGER NOT NULL REFERENCES scoring_configs(id) ON DELETE CASCADE,
            passes_requirements INTEGER NOT NULL DEFAULT 0,
            requirement_results TEXT NOT NULL DEFAULT '[]',
            total_score REAL NOT NULL DEFAULT 0.0,
            score_breakdown TEXT NOT NULL DEFAULT '[]',
            tier TEXT NOT NULL DEFAULT 'nurture',
            scoring_notes TEXT,
            scored_at INTEGER,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS prompts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prompt_type TEXT NOT NULL UNIQUE,
            content TEXT NOT NULL DEFAULT '',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            use_chrome INTEGER NOT NULL DEFAULT 0,
            orchestration_enabled INTEGER NOT NULL DEFAULT 1,
            default_research_depth TEXT NOT NULL DEFAULT 'light',
            apollo_enabled INTEGER NOT NULL DEFAULT 0,
            apollo_max_contacts INTEGER NOT NULL DEFAULT 10,
            deep_job_concurrency INTEGER NOT NULL DEFAULT 1,
            daily_budget_usd_cents INTEGER,
            updated_at INTEGER NOT NULL
        );

        INSERT OR IGNORE INTO settings (
            id, use_chrome, orchestration_enabled, default_research_depth,
            apollo_enabled, apollo_max_contacts, deep_job_concurrency,
            daily_budget_usd_cents, updated_at
        )
        VALUES (1, 0, 1, 'light', 0, 10, 1, NULL, strftime('%s', 'now') * 1000);

        CREATE TABLE IF NOT EXISTS battlecards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
            signal_id INTEGER REFERENCES signals(id) ON DELETE SET NULL,
            competitor_name TEXT NOT NULL,
            overview TEXT NOT NULL DEFAULT '',
            strengths TEXT NOT NULL DEFAULT '[]',
            weaknesses TEXT NOT NULL DEFAULT '[]',
            talk_tracks TEXT NOT NULL DEFAULT '[]',
            kill_criteria TEXT NOT NULL DEFAULT '[]',
            recommended_approach TEXT NOT NULL DEFAULT '',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_people_lead_id ON people(lead_id);
        CREATE INDEX IF NOT EXISTS idx_memory_entity ON memory(entity_type, entity_id);
        CREATE INDEX IF NOT EXISTS idx_signals_lead_id ON signals(lead_id);
        CREATE INDEX IF NOT EXISTS idx_signals_detected_at ON signals(detected_at);
        CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
        CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
        CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON job_logs(job_id);
        CREATE INDEX IF NOT EXISTS idx_company_scores_lead_id ON company_scores(lead_id);
        CREATE INDEX IF NOT EXISTS idx_battlecards_lead_id ON battlecards(lead_id);
        CREATE INDEX IF NOT EXISTS idx_battlecards_signal_id ON battlecards(signal_id);
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
