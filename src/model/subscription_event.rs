use super::Subscription;
use chrono::{DateTime, Utc};
use schema::subscription_event;
use uuid::Uuid;

#[derive(Queryable, Serialize, Identifiable, Associations)]
#[belongs_to(Subscription)]
#[table_name = "subscription_event"]
pub struct SubscriptionEvent {
    pub id: Uuid,
    pub status: bool,
    pub message: String,
    #[column_name = "updated_at"]
    pub time: DateTime<Utc>,
    #[serde(skip)]
    pub subscription_id: Uuid,
}

#[derive(Insertable)]
#[table_name = "subscription_event"]
pub struct NewSubscriptionEvent {
    pub status: bool,
    pub message: String,
    pub subscription_id: Uuid,
}
