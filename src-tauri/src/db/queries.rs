use rusqlite::{params, Connection, OptionalExtension};

use super::schema::*;

// ============================================================================
// Lead (Company) Queries
// ============================================================================

pub fn get_all_leads(conn: &Connection) -> Result<Vec<Lead>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, company_name, website, industry, sub_industry, employees, employee_range,
                    revenue, revenue_range, company_linkedin_url, city, state, country,
                    research_status, researched_at, user_status, created_at, company_profile
             FROM leads ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Lead {
                id: row.get(0)?,
                company_name: row.get(1)?,
                website: row.get(2)?,
                industry: row.get(3)?,
                sub_industry: row.get(4)?,
                employees: row.get(5)?,
                employee_range: row.get(6)?,
                revenue: row.get(7)?,
                revenue_range: row.get(8)?,
                company_linkedin_url: row.get(9)?,
                city: row.get(10)?,
                state: row.get(11)?,
                country: row.get(12)?,
                research_status: row.get(13)?,
                researched_at: row.get(14)?,
                user_status: row.get(15)?,
                created_at: row.get(16)?,
                company_profile: row.get(17)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

pub fn get_lead(conn: &Connection, id: i64) -> Result<Option<Lead>, String> {
    conn.query_row(
        "SELECT id, company_name, website, industry, sub_industry, employees, employee_range,
                revenue, revenue_range, company_linkedin_url, city, state, country,
                research_status, researched_at, user_status, created_at, company_profile
         FROM leads WHERE id = ?1",
        params![id],
        |row| {
            Ok(Lead {
                id: row.get(0)?,
                company_name: row.get(1)?,
                website: row.get(2)?,
                industry: row.get(3)?,
                sub_industry: row.get(4)?,
                employees: row.get(5)?,
                employee_range: row.get(6)?,
                revenue: row.get(7)?,
                revenue_range: row.get(8)?,
                company_linkedin_url: row.get(9)?,
                city: row.get(10)?,
                state: row.get(11)?,
                country: row.get(12)?,
                research_status: row.get(13)?,
                researched_at: row.get(14)?,
                user_status: row.get(15)?,
                created_at: row.get(16)?,
                company_profile: row.get(17)?,
            })
        },
    )
    .optional()
    .map_err(|e| e.to_string())
}

pub fn insert_lead(conn: &Connection, data: &NewLead) -> Result<i64, String> {
    let now = chrono::Utc::now().timestamp_millis();
    conn.execute(
        "INSERT INTO leads (company_name, website, city, state, country, research_status, user_status, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, 'pending', 'new', ?6)",
        params![
            data.company_name,
            data.website,
            data.city,
            data.state,
            data.country,
            now
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

pub fn update_lead_user_status(conn: &Connection, lead_id: i64, status: &str) -> Result<(), String> {
    conn.execute(
        "UPDATE leads SET user_status = ?1 WHERE id = ?2",
        params![status, lead_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn update_lead_research_status(conn: &Connection, lead_id: i64, status: &str) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp_millis();
    conn.execute(
        "UPDATE leads SET research_status = ?1, researched_at = ?2 WHERE id = ?3",
        params![status, now, lead_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn delete_leads(conn: &Connection, ids: &[i64]) -> Result<usize, String> {
    if ids.is_empty() {
        return Ok(0);
    }
    let placeholders: Vec<String> = ids.iter().map(|_| "?".to_string()).collect();
    let sql = format!("DELETE FROM leads WHERE id IN ({})", placeholders.join(","));

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let params: Vec<&dyn rusqlite::types::ToSql> = ids.iter().map(|id| id as &dyn rusqlite::types::ToSql).collect();
    let count = stmt.execute(params.as_slice()).map_err(|e| e.to_string())?;
    Ok(count)
}

pub fn get_adjacent_leads(conn: &Connection, current_id: i64) -> Result<AdjacentResult, String> {
    let all_ids: Vec<i64> = {
        let mut stmt = conn
            .prepare("SELECT id FROM leads ORDER BY created_at DESC")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| row.get(0))
            .map_err(|e| e.to_string())?;
        rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?
    };

    let total = all_ids.len() as i64;
    let current_index = all_ids.iter().position(|&id| id == current_id);

    match current_index {
        Some(idx) => {
            let prev = if idx > 0 { Some(all_ids[idx - 1]) } else { None };
            let next = if idx + 1 < all_ids.len() { Some(all_ids[idx + 1]) } else { None };
            Ok(AdjacentResult {
                prev_lead: prev,
                next_lead: next,
                current_index: idx as i64,
                total,
            })
        }
        None => Ok(AdjacentResult {
            prev_lead: None,
            next_lead: None,
            current_index: 0,
            total,
        }),
    }
}

// ============================================================================
// People (Contact) Queries
// ============================================================================

pub fn get_all_people(conn: &Connection) -> Result<Vec<PersonWithCompany>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT p.id, p.lead_id, p.first_name, p.last_name, p.email, p.title,
                    p.management_level, p.linkedin_url, p.person_profile,
                    p.research_status, p.researched_at, p.user_status, p.created_at,
                    l.company_name, l.website, l.industry
             FROM people p
             LEFT JOIN leads l ON p.lead_id = l.id
             ORDER BY p.created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(PersonWithCompany {
                id: row.get(0)?,
                lead_id: row.get(1)?,
                first_name: row.get(2)?,
                last_name: row.get(3)?,
                email: row.get(4)?,
                title: row.get(5)?,
                management_level: row.get(6)?,
                linkedin_url: row.get(7)?,
                person_profile: row.get(8)?,
                research_status: row.get(9)?,
                researched_at: row.get(10)?,
                user_status: row.get(11)?,
                created_at: row.get(12)?,
                company_name: row.get(13)?,
                company_website: row.get(14)?,
                company_industry: row.get(15)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

pub fn get_person(conn: &Connection, id: i64) -> Result<Option<PersonWithCompany>, String> {
    conn.query_row(
        "SELECT p.id, p.lead_id, p.first_name, p.last_name, p.email, p.title,
                p.management_level, p.linkedin_url, p.person_profile,
                p.research_status, p.researched_at, p.user_status, p.created_at,
                l.company_name, l.website, l.industry
         FROM people p
         LEFT JOIN leads l ON p.lead_id = l.id
         WHERE p.id = ?1",
        params![id],
        |row| {
            Ok(PersonWithCompany {
                id: row.get(0)?,
                lead_id: row.get(1)?,
                first_name: row.get(2)?,
                last_name: row.get(3)?,
                email: row.get(4)?,
                title: row.get(5)?,
                management_level: row.get(6)?,
                linkedin_url: row.get(7)?,
                person_profile: row.get(8)?,
                research_status: row.get(9)?,
                researched_at: row.get(10)?,
                user_status: row.get(11)?,
                created_at: row.get(12)?,
                company_name: row.get(13)?,
                company_website: row.get(14)?,
                company_industry: row.get(15)?,
            })
        },
    )
    .optional()
    .map_err(|e| e.to_string())
}

pub fn get_people_for_lead(conn: &Connection, lead_id: i64) -> Result<Vec<Person>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, lead_id, first_name, last_name, email, title,
                    management_level, linkedin_url, person_profile,
                    research_status, researched_at, user_status, created_at
             FROM people WHERE lead_id = ?1 ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![lead_id], |row| {
            Ok(Person {
                id: row.get(0)?,
                lead_id: row.get(1)?,
                first_name: row.get(2)?,
                last_name: row.get(3)?,
                email: row.get(4)?,
                title: row.get(5)?,
                management_level: row.get(6)?,
                linkedin_url: row.get(7)?,
                person_profile: row.get(8)?,
                research_status: row.get(9)?,
                researched_at: row.get(10)?,
                user_status: row.get(11)?,
                created_at: row.get(12)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

pub fn insert_person(conn: &Connection, data: &NewPerson) -> Result<i64, String> {
    let now = chrono::Utc::now().timestamp_millis();
    conn.execute(
        "INSERT INTO people (lead_id, first_name, last_name, email, title, linkedin_url, research_status, user_status, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'pending', 'new', ?7)",
        params![
            data.company_id,
            data.first_name,
            data.last_name,
            data.email,
            data.title,
            data.linkedin_url,
            now
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

pub fn update_person_user_status(conn: &Connection, person_id: i64, status: &str) -> Result<(), String> {
    conn.execute(
        "UPDATE people SET user_status = ?1 WHERE id = ?2",
        params![status, person_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn delete_people(conn: &Connection, ids: &[i64]) -> Result<usize, String> {
    if ids.is_empty() {
        return Ok(0);
    }
    let placeholders: Vec<String> = ids.iter().map(|_| "?".to_string()).collect();
    let sql = format!("DELETE FROM people WHERE id IN ({})", placeholders.join(","));

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let params: Vec<&dyn rusqlite::types::ToSql> = ids.iter().map(|id| id as &dyn rusqlite::types::ToSql).collect();
    let count = stmt.execute(params.as_slice()).map_err(|e| e.to_string())?;
    Ok(count)
}

pub fn get_adjacent_people(conn: &Connection, current_id: i64) -> Result<AdjacentResult, String> {
    let all_ids: Vec<i64> = {
        let mut stmt = conn
            .prepare("SELECT id FROM people ORDER BY created_at DESC")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| row.get(0))
            .map_err(|e| e.to_string())?;
        rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())?
    };

    let total = all_ids.len() as i64;
    let current_index = all_ids.iter().position(|&id| id == current_id);

    match current_index {
        Some(idx) => {
            let prev = if idx > 0 { Some(all_ids[idx - 1]) } else { None };
            let next = if idx + 1 < all_ids.len() { Some(all_ids[idx + 1]) } else { None };
            Ok(AdjacentResult {
                prev_lead: prev,
                next_lead: next,
                current_index: idx as i64,
                total,
            })
        }
        None => Ok(AdjacentResult {
            prev_lead: None,
            next_lead: None,
            current_index: 0,
            total,
        }),
    }
}

// ============================================================================
// Settings Queries
// ============================================================================

pub fn get_settings(conn: &Connection) -> Result<Settings, String> {
    conn.query_row(
        "SELECT use_chrome, orchestration_enabled, default_research_depth,
                apollo_enabled, apollo_max_contacts, deep_job_concurrency,
                daily_budget_usd_cents, updated_at
         FROM settings WHERE id = 1",
        [],
        |row| {
            Ok(Settings {
                use_chrome: row.get::<_, i64>(0)? != 0,
                orchestration_enabled: row.get::<_, i64>(1)? != 0,
                default_research_depth: row.get(2)?,
                apollo_enabled: row.get::<_, i64>(3)? != 0,
                apollo_max_contacts: row.get(4)?,
                deep_job_concurrency: row.get(5)?,
                daily_budget_usd_cents: row.get(6)?,
                updated_at: row.get(7)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

pub fn update_settings_chrome(conn: &Connection, use_chrome: bool) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp_millis();
    conn.execute(
        "UPDATE settings SET use_chrome = ?1, updated_at = ?2 WHERE id = 1",
        params![use_chrome as i64, now],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn update_orchestration_settings(
    conn: &Connection,
    orchestration_enabled: bool,
    default_research_depth: &str,
    apollo_enabled: bool,
    apollo_max_contacts: i64,
    deep_job_concurrency: i64,
    daily_budget_usd_cents: Option<i64>,
) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp_millis();
    conn.execute(
        "UPDATE settings SET orchestration_enabled = ?1, default_research_depth = ?2,
         apollo_enabled = ?3, apollo_max_contacts = ?4, deep_job_concurrency = ?5,
         daily_budget_usd_cents = ?6, updated_at = ?7 WHERE id = 1",
        params![
            orchestration_enabled as i64,
            default_research_depth,
            apollo_enabled as i64,
            apollo_max_contacts,
            deep_job_concurrency,
            daily_budget_usd_cents,
            now
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

// ============================================================================
// Prompt Queries
// ============================================================================

pub fn get_prompt_by_type(conn: &Connection, prompt_type: &str) -> Result<Option<PromptRow>, String> {
    conn.query_row(
        "SELECT id, prompt_type, content, created_at, updated_at FROM prompts WHERE prompt_type = ?1",
        params![prompt_type],
        |row| {
            Ok(PromptRow {
                id: row.get(0)?,
                prompt_type: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        },
    )
    .optional()
    .map_err(|e| e.to_string())
}

pub fn save_prompt_by_type(conn: &Connection, prompt_type: &str, content: &str) -> Result<i64, String> {
    let now = chrono::Utc::now().timestamp_millis();
    conn.execute(
        "INSERT INTO prompts (prompt_type, content, created_at, updated_at) VALUES (?1, ?2, ?3, ?3)
         ON CONFLICT(prompt_type) DO UPDATE SET content = ?2, updated_at = ?3",
        params![prompt_type, content, now],
    )
    .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

// ============================================================================
// Scoring Config Queries
// ============================================================================

pub fn get_active_scoring_config(conn: &Connection) -> Result<Option<ScoringConfigRow>, String> {
    conn.query_row(
        "SELECT id, name, is_active, required_characteristics, demand_signifiers,
                tier_hot_min, tier_warm_min, tier_nurture_min, created_at, updated_at
         FROM scoring_configs WHERE is_active = 1 LIMIT 1",
        [],
        |row| {
            Ok(ScoringConfigRow {
                id: row.get(0)?,
                name: row.get(1)?,
                is_active: row.get::<_, i64>(2)? != 0,
                required_characteristics: row.get(3)?,
                demand_signifiers: row.get(4)?,
                tier_hot_min: row.get(5)?,
                tier_warm_min: row.get(6)?,
                tier_nurture_min: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        },
    )
    .optional()
    .map_err(|e| e.to_string())
}

pub fn get_lead_score(conn: &Connection, lead_id: i64) -> Result<Option<CompanyScoreRow>, String> {
    conn.query_row(
        "SELECT id, lead_id, config_id, passes_requirements, requirement_results,
                total_score, score_breakdown, tier, scoring_notes, scored_at, created_at
         FROM company_scores WHERE lead_id = ?1 ORDER BY created_at DESC LIMIT 1",
        params![lead_id],
        |row| {
            Ok(CompanyScoreRow {
                id: row.get(0)?,
                lead_id: row.get(1)?,
                config_id: row.get(2)?,
                passes_requirements: row.get::<_, i64>(3)? != 0,
                requirement_results: row.get(4)?,
                total_score: row.get(5)?,
                score_breakdown: row.get(6)?,
                tier: row.get(7)?,
                scoring_notes: row.get(8)?,
                scored_at: row.get(9)?,
                created_at: row.get(10)?,
            })
        },
    )
    .optional()
    .map_err(|e| e.to_string())
}

// ============================================================================
// Job Queries
// ============================================================================

pub fn get_jobs_active(conn: &Connection) -> Result<Vec<JobRow>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, job_type, entity_id, entity_label, status, prompt, model, working_dir,
                    output_path, exit_code, error_message, created_at, started_at, completed_at, pid
             FROM jobs WHERE status IN ('queued', 'running') ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt.query_map([], map_job_row).map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

pub fn get_jobs_recent(conn: &Connection, limit: i64) -> Result<Vec<JobRow>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, job_type, entity_id, entity_label, status, prompt, model, working_dir,
                    output_path, exit_code, error_message, created_at, started_at, completed_at, pid
             FROM jobs ORDER BY created_at DESC LIMIT ?1",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt.query_map(params![limit], map_job_row).map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

pub fn get_job_by_id(conn: &Connection, job_id: &str) -> Result<Option<JobRow>, String> {
    conn.query_row(
        "SELECT id, job_type, entity_id, entity_label, status, prompt, model, working_dir,
                output_path, exit_code, error_message, created_at, started_at, completed_at, pid
         FROM jobs WHERE id = ?1",
        params![job_id],
        map_job_row,
    )
    .optional()
    .map_err(|e| e.to_string())
}

pub fn insert_job(conn: &Connection, job: &JobRow) -> Result<(), String> {
    conn.execute(
        "INSERT INTO jobs (id, job_type, entity_id, entity_label, status, prompt, model,
                          working_dir, output_path, exit_code, error_message,
                          created_at, started_at, completed_at, pid)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
        params![
            job.id, job.job_type, job.entity_id, job.entity_label, job.status,
            job.prompt, job.model, job.working_dir, job.output_path, job.exit_code,
            job.error_message, job.created_at, job.started_at, job.completed_at, job.pid,
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn update_job_status(conn: &Connection, job_id: &str, status: &str, exit_code: Option<i32>) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp_millis();
    conn.execute(
        "UPDATE jobs SET status = ?1, exit_code = ?2, completed_at = ?3 WHERE id = ?4",
        params![status, exit_code, now, job_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

// ============================================================================
// Job Log Queries
// ============================================================================

pub fn get_job_logs(conn: &Connection, job_id: &str, after_sequence: Option<i64>, limit: Option<i64>) -> Result<Vec<JobLogRow>, String> {
    let after_seq = after_sequence.unwrap_or(-1);
    let lim = limit.unwrap_or(500);

    let mut stmt = conn
        .prepare(
            "SELECT id, job_id, log_type, content, tool_name, timestamp, sequence, source
             FROM job_logs WHERE job_id = ?1 AND sequence > ?2 ORDER BY sequence ASC LIMIT ?3",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![job_id, after_seq, lim], |row| {
            Ok(JobLogRow {
                id: row.get(0)?,
                job_id: row.get(1)?,
                log_type: row.get(2)?,
                content: row.get(3)?,
                tool_name: row.get(4)?,
                timestamp: row.get(5)?,
                sequence: row.get(6)?,
                source: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

// ============================================================================
// Onboarding
// ============================================================================

pub fn get_onboarding_status(conn: &Connection) -> Result<OnboardingStatus, String> {
    let has_company_overview: bool = conn
        .query_row(
            "SELECT COUNT(*) FROM prompts WHERE prompt_type = 'company_overview'",
            [],
            |row| row.get::<_, i64>(0),
        )
        .unwrap_or(0)
        > 0;

    let has_lead: bool = conn
        .query_row("SELECT COUNT(*) FROM leads", [], |row| row.get::<_, i64>(0))
        .unwrap_or(0)
        > 0;

    let has_researched_lead: bool = conn
        .query_row(
            "SELECT COUNT(*) FROM leads WHERE research_status = 'completed'",
            [],
            |row| row.get::<_, i64>(0),
        )
        .unwrap_or(0)
        > 0;

    let has_scored_lead: bool = conn
        .query_row("SELECT COUNT(*) FROM company_scores", [], |row| {
            row.get::<_, i64>(0)
        })
        .unwrap_or(0)
        > 0;

    let has_researched_person: bool = conn
        .query_row(
            "SELECT COUNT(*) FROM people WHERE research_status = 'completed'",
            [],
            |row| row.get::<_, i64>(0),
        )
        .unwrap_or(0)
        > 0;

    let has_conversation_topics: bool = conn
        .query_row(
            "SELECT COUNT(*) FROM people WHERE person_profile IS NOT NULL AND person_profile != ''",
            [],
            |row| row.get::<_, i64>(0),
        )
        .unwrap_or(0)
        > 0;

    Ok(OnboardingStatus {
        has_company_overview,
        has_lead,
        has_researched_lead,
        has_scored_lead,
        has_researched_person,
        has_conversation_topics,
    })
}

// ============================================================================
// Helpers
// ============================================================================

fn map_job_row(row: &rusqlite::Row) -> Result<JobRow, rusqlite::Error> {
    Ok(JobRow {
        id: row.get(0)?,
        job_type: row.get(1)?,
        entity_id: row.get(2)?,
        entity_label: row.get(3)?,
        status: row.get(4)?,
        prompt: row.get(5)?,
        model: row.get(6)?,
        working_dir: row.get(7)?,
        output_path: row.get(8)?,
        exit_code: row.get(9)?,
        error_message: row.get(10)?,
        created_at: row.get(11)?,
        started_at: row.get(12)?,
        completed_at: row.get(13)?,
        pid: row.get(14)?,
    })
}

pub fn get_jobs_by_status(conn: &Connection, status: &str, limit: i64) -> Result<Vec<JobRow>, String> {
    let mut stmt = conn
        .prepare("SELECT * FROM jobs WHERE status = ?1 ORDER BY created_at ASC LIMIT ?2")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(rusqlite::params![status, limit], |row| {
            Ok(JobRow {
                id: row.get(0)?,
                job_type: row.get(1)?,
                entity_id: row.get(2)?,
                entity_label: row.get(3)?,
                status: row.get(4)?,
                prompt: row.get(5)?,
                model: row.get(6)?,
                working_dir: row.get(7)?,
                output_path: row.get(8)?,
                exit_code: row.get(9)?,
                error_message: row.get(10)?,
                created_at: row.get(11)?,
                started_at: row.get(12)?,
                completed_at: row.get(13)?,
                pid: row.get(14)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect();

    Ok(rows)
}

pub fn mark_lead_verified(conn: &Connection, lead_id: i64) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp_millis();
    conn.execute(
        "UPDATE leads SET researched_at = ?1 WHERE id = ?2",
        rusqlite::params![now, lead_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn insert_battlecard(
    conn: &Connection,
    lead_id: i64,
    signal_id: Option<i64>,
    competitor_name: &str,
    overview: &str,
    strengths: &str,
    weaknesses: &str,
    talk_tracks: &str,
    kill_criteria: &str,
    recommended_approach: &str,
) -> Result<i64, String> {
    let now = chrono::Utc::now().timestamp_millis();
    conn.execute(
        "INSERT INTO battlecards (lead_id, signal_id, competitor_name, overview, strengths, weaknesses, talk_tracks, kill_criteria, recommended_approach, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            lead_id, signal_id, competitor_name, overview, strengths, weaknesses,
            talk_tracks, kill_criteria, recommended_approach, now, now
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

pub fn get_battlecards_for_lead(conn: &Connection, lead_id: i64) -> Result<Vec<BattlecardRow>, String> {
    let mut stmt = conn
        .prepare("SELECT id, lead_id, signal_id, competitor_name, overview, strengths, weaknesses, talk_tracks, kill_criteria, recommended_approach, created_at, updated_at FROM battlecards WHERE lead_id = ?1 ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(rusqlite::params![lead_id], |row| {
            Ok(BattlecardRow {
                id: row.get(0)?,
                lead_id: row.get(1)?,
                signal_id: row.get(2)?,
                competitor_name: row.get(3)?,
                overview: row.get(4)?,
                strengths: row.get(5)?,
                weaknesses: row.get(6)?,
                talk_tracks: row.get(7)?,
                kill_criteria: row.get(8)?,
                recommended_approach: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect();

    Ok(rows)
}

pub fn get_battlecard_by_signal(conn: &Connection, signal_id: i64) -> Result<Option<BattlecardRow>, String> {
    let mut stmt = conn
        .prepare("SELECT id, lead_id, signal_id, competitor_name, overview, strengths, weaknesses, talk_tracks, kill_criteria, recommended_approach, created_at, updated_at FROM battlecards WHERE signal_id = ?1 LIMIT 1")
        .map_err(|e| e.to_string())?;

    let mut rows = stmt
        .query_map(rusqlite::params![signal_id], |row| {
            Ok(BattlecardRow {
                id: row.get(0)?,
                lead_id: row.get(1)?,
                signal_id: row.get(2)?,
                competitor_name: row.get(3)?,
                overview: row.get(4)?,
                strengths: row.get(5)?,
                weaknesses: row.get(6)?,
                talk_tracks: row.get(7)?,
                kill_criteria: row.get(8)?,
                recommended_approach: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?;

    match rows.next() {
        Some(Ok(row)) => Ok(Some(row)),
        _ => Ok(None),
    }
}
