use tauri::{AppHandle, State};
use crate::db::DbState;
use crate::db::queries;
use crate::db::schema::NewLead;
use crate::core::apollo;

#[tauri::command]
pub async fn search_apollo_companies(query: String) -> Result<Vec<apollo::ApolloCompany>, String> {
    apollo::search_companies(&query).await
}

#[tauri::command]
pub async fn import_apollo_company(
    company: apollo::ApolloCompany,
    app: AppHandle,
    db: State<'_, DbState>,
) -> Result<i64, String> {
    let new_lead = NewLead {
        company_name: company.name,
        website: company.website_url.or(company.primary_domain),
        city: None,
        state: None,
        country: None,
    };

    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let id = queries::insert_lead(&conn, &new_lead)?;
    
    // Also save the description to company profile if available
    if let Some(desc) = company.short_description {
        let _ = queries::save_lead_company_profile(&conn, id, &desc);
    }
    
    crate::events::emit_entity_updated(&app, "leads", id);
    Ok(id)
}
