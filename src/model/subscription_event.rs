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
    pub subscription_id: Uuid,
}

#[derive(Insertable)]
#[table_name = "subscription_event"]
pub struct NewSubscriptionEvent<'a> {
    pub status: &'a bool,
    pub message: &'a str,
    #[column_name = "updated_at"]
    pub time: &'a DateTime<Utc>,
    pub subscription_id: &'a Uuid,
}
