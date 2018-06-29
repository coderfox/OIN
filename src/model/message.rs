use super::Subscription;
use chrono::{DateTime, Utc};
use schema::message;
use uuid::Uuid;

#[derive(Queryable, Serialize, Identifiable, Associations)]
#[belongs_to(Subscription)]
#[table_name = "message"]
pub struct Message {
    pub id: Uuid,
    pub readed: bool,
    pub title: String,
    pub summary: String,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(rename = "subscription")]
    pub subscription_id: Uuid,
    pub href: Option<String>,
}

#[derive(AsChangeset, Default, Deserialize)]
#[table_name = "message"]
pub struct MessageChangeset {
    pub readed: Option<bool>,
}

#[derive(Serialize)]
pub struct MessageView {
    #[serde(flatten)]
    pub message: Message,
    #[serde(rename = "owner")]
    pub owner_id: Uuid,
}

impl From<(Message, Uuid)> for MessageView {
    fn from((message, owner_id): (Message, Uuid)) -> Self {
        Self { message, owner_id }
    }
}

impl From<(Message, Subscription)> for MessageView {
    fn from((message, subscription): (Message, Subscription)) -> Self {
        Self {
            message,
            owner_id: subscription.owner_id,
        }
    }
}
