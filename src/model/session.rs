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
    #[serde(skip)]
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
    #[serde(flatten)]
    pub session: &'a Session,
}

impl<'a> From<(&'a Session, &'a User)> for SessionView<'a> {
    fn from((session, user): (&'a Session, &'a User)) -> Self {
        Self {
            session: &session,
            user: &user,
        }
    }
}

pub trait HasOwner {
    fn is_owned_by(session: Session) -> bool;
}
