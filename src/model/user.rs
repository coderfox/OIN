use bcrypt::{hash, verify, BcryptError, DEFAULT_COST};
use chrono::{DateTime, Utc};
use schema::user;
use uuid::Uuid;

#[derive(Queryable, Serialize, Identifiable)]
#[table_name = "user"]
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

impl User {
    pub fn validate_password(&self, password: &str) -> Result<bool, BcryptError> {
        verify(password, &self.hashed_password)
    }
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
            hashed_password: NewUser::hash_password(password)?,
        })
    }
    pub fn hash_password(password: &str) -> Result<String, BcryptError> {
        hash(
            password,
            if cfg!(debug_assertions) {
                4
            } else {
                DEFAULT_COST
            },
        )
    }
}
