use super::{Service, SubscriptionEvent, User};
use chrono::{DateTime, Utc};
use schema::subscription;
use uuid::Uuid;

#[derive(Queryable, Serialize, Identifiable, Associations, AsChangeset)]
#[belongs_to(User, foreign_key = "owner_id")]
#[belongs_to(Service)]
#[table_name = "subscription"]
pub struct Subscription {
    pub id: Uuid,
    pub config: String,
    pub deleted: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(rename = "owner")]
    pub owner_id: Uuid,
    #[serde(rename = "service")]
    pub service_id: Uuid,
    pub name: String,
}

#[derive(Insertable)]
#[table_name = "subscription"]
pub struct NewSubscription {
    pub config: String,
    pub owner_id: Uuid,
    pub service_id: Uuid,
    pub name: String,
}

#[derive(AsChangeset, Default)]
#[table_name = "subscription"]
pub struct SubscriptionChangeset {
    pub config: Option<String>,
    pub name: Option<String>,
    pub deleted: Option<bool>,
}

#[derive(Serialize)]
pub struct SubscriptionView {
    #[serde(flatten)]
    pub subscription: Subscription,
    pub last_event: Option<SubscriptionEvent>,
}

impl From<(Subscription, Option<SubscriptionEvent>)> for SubscriptionView {
    fn from((subscription, event): (Subscription, Option<SubscriptionEvent>)) -> Self {
        Self {
            subscription: subscription,
            last_event: event,
        }
    }
}
