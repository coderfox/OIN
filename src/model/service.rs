use chrono::{DateTime, Utc};
use schema::service;
use uuid::Uuid;

#[derive(Queryable, Serialize, Identifiable)]
#[table_name = "service"]
pub struct Service {
    pub id: Uuid,
    pub name: String,
    #[serde(skip)]
    pub token: Uuid,
    pub description: Option<String>,
    #[serde(skip)]
    pub created_at: DateTime<Utc>,
    #[serde(skip)]
    pub updated_at: DateTime<Utc>,
}
