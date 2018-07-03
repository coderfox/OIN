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
    // TODO: support priority
}

#[derive(Queryable, Serialize, Identifiable, Associations)]
#[belongs_to(Subscription)]
#[table_name = "message"]
pub struct MessageSimple {
    pub id: Uuid,
    pub readed: bool,
    pub title: String,
    pub summary: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(rename = "subscription")]
    pub subscription_id: Uuid,
    pub href: Option<String>,
    // TODO: support priority
}

impl From<Message> for MessageSimple {
    fn from(message: Message) -> Self {
        Self {
            id: message.id,
            readed: message.readed,
            title: message.title,
            summary: message.summary,
            created_at: message.created_at,
            updated_at: message.updated_at,
            subscription_id: message.subscription_id,
            href: message.href,
        }
    }
}

#[derive(AsChangeset, Default, Deserialize)]
#[table_name = "message"]
pub struct MessageChangeset {
    pub readed: Option<bool>,
}

#[derive(Serialize)]
pub struct MessageSimpleView {
    #[serde(flatten)]
    pub message: MessageSimple,
    #[serde(rename = "owner")]
    pub owner_id: Uuid,
}

impl<T> From<(T, Uuid)> for MessageSimpleView
where
    T: Into<MessageSimple>,
{
    fn from((message, owner_id): (T, Uuid)) -> Self {
        Self {
            message: message.into(),
            owner_id,
        }
    }
}

impl<T> From<(T, Subscription)> for MessageSimpleView
where
    T: Into<MessageSimple>,
{
    fn from((message, subscription): (T, Subscription)) -> Self {
        Self::from((message.into(), subscription.owner_id))
    }
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

#[derive(Insertable)]
#[table_name = "message"]
pub struct NewMessage {
    pub title: String,
    pub summary: String,
    pub content: String,
    pub subscription_id: Uuid,
    pub href: Option<String>,
}
