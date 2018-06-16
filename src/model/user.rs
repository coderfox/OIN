use bcrypt::{hash, BcryptError, DEFAULT_COST};
use chrono::{DateTime, Utc};
use schema::user;
use uuid::Uuid;

#[derive(Queryable, Serialize)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    #[column_name = "password"]
    #[serde(skip_serializing)]
    pub hashed_password: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub delete_token: Option<Uuid>,
    pub nickname: String,
}

#[derive(Insertable)]
#[table_name = "user"]
pub struct NewUser<'a> {
    pub email: &'a str,
    #[column_name = "password"]
    pub hashed_password: String,
    pub nickname: &'a str,
}

impl<'a> NewUser<'a> {
    pub fn new(
        email: &'a str,
        password: &'a str,
        nickname: &'a str,
    ) -> Result<NewUser<'a>, BcryptError> {
        Ok(NewUser {
            email,
            nickname,
            hashed_password: hash(password, DEFAULT_COST)?,
        })
    }
}
