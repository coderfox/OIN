use super::user::User;
use super::PermissionEnum;
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
    pub permissions: Vec<PermissionEnum>,
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
    pub permissions: &'a Vec<PermissionEnum>,
}

impl<'a> From<(&'a Session, &'a User)> for SessionView<'a> {
    fn from((session, user): (&'a Session, &'a User)) -> Self {
        Self {
            token: &session.token,
            user: &user,
            created_at: &session.created_at,
            updated_at: &session.updated_at,
            expires_at: &session.expires_at,
            permissions: &session.permissions,
        }
    }
}
