use chrono::{DateTime, Utc};
use schema::user;
use uuid::Uuid;

#[derive(Queryable, Serialize)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub password: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub delete_token: Option<Uuid>,
    pub nickname: String,
}

#[derive(Insertable)]
#[table_name = "user"]
pub struct NewUser<'a> {
    pub email: &'a str,
    pub password: &'a str,
    pub nickname: &'a str,
}
