use super::user::User;
use chrono::{DateTime, Utc};
use schema::session;
use uuid::Uuid;

#[derive(Queryable, Serialize, Identifiable, Associations)]
#[table_name = "session"]
#[belongs_to(User)]
#[primary_key(token)]
pub struct Session {
    pub token: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub user_id: Uuid,
}

impl Session {
    pub fn is_valid(&self) -> bool {
        self.expires_at >= Utc::now()
    }
}

#[derive(Insertable)]
#[table_name = "session"]
pub struct NewSession {
    pub user_id: Uuid,
}

#[derive(Serialize)]
pub struct SessionView<'a> {
    pub user: &'a User,
    pub token: &'a Uuid,
    pub created_at: &'a DateTime<Utc>,
    pub updated_at: &'a DateTime<Utc>,
    pub expires_at: &'a DateTime<Utc>,
}
