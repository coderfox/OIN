use super::{SubscriptionEvent, User};
use chrono::{DateTime, Utc};
use schema::subscription;
use uuid::Uuid;

#[derive(Queryable, Serialize, Identifiable, Associations)]
#[belongs_to(User, foreign_key = "owner_id")]
#[table_name = "subscription"]
pub struct Subscription {
    pub id: Uuid,
    pub config: String,
    pub deleted: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub owner_id: Uuid,
    pub service_id: Uuid,
    pub name: String,
}

#[derive(Insertable)]
#[table_name = "subscription"]
pub struct NewSubscription<'a> {
    pub config: &'a str,
    pub owner_id: &'a Uuid,
    pub service_id: &'a Uuid,
    pub name: &'a str,
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
