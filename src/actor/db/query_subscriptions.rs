use super::DbExecutor;
use actix::prelude::{Handler, Message as ActixMessage};
use diesel::prelude::RunQueryDsl;
use diesel::{BoxableExpression, ExpressionMethods, QueryDsl, TextExpressionMethods};
use futures::Future;
use model::{Subscription, SubscriptionEvent};
use state::{AppState, QueryError};
use uuid::Uuid;

pub type QuerySubscriptionsResult =
    Result<Vec<(Subscription, Option<SubscriptionEvent>)>, QuerySubscriptionsError>;
pub enum QuerySubscriptionsError {
    InvalidFilterError,
    QueryError(QueryError),
}

pub struct QuerySubscriptions {
    pub filter: String,
    pub user_id: Uuid,
}

impl QuerySubscriptions {
    pub fn new(filter: String, user_id: Uuid) -> Self {
        Self { filter, user_id }
    }
}

impl ActixMessage for QuerySubscriptions {
    type Result = QuerySubscriptionsResult;
}

impl Handler<QuerySubscriptions> for DbExecutor {
    type Result = QuerySubscriptionsResult;

    fn handle(
        &mut self,
        QuerySubscriptions { filter, user_id }: QuerySubscriptions,
        _: &mut Self::Context,
    ) -> Self::Result {
        use schema::{subscription, subscription_event};

        let query = filter
            .split(" ")
            .into_iter()
            .map(
                |filter| -> Option<Box<dyn BoxableExpression<_, _, SqlType = _>>> {
                    let mut parts = filter.split(":");
                    let ty = parts.next();
                    let val = parts.next();
                    if ty == None {
                        None
                    } else {
                        if let Some(v) = val {
                            match ty.unwrap() {
                                "enabled" => Some(Box::new(subscription::deleted.eq(v != "true"))),
                                "service" => Uuid::parse_str(v)
                                    .map(|v| {
                                        Some(Box::new(subscription::service_id.eq(v))
                                            as Box<dyn BoxableExpression<_, _, SqlType = _>>)
                                    })
                                    .unwrap_or(None),
                                _ => None,
                            }
                        } else {
                            Some(Box::new(
                                subscription::name.like(format!("%{}%", ty.unwrap())),
                            ))
                        }
                    }
                },
                // TODO: only return fields used
            )
            .collect::<Option<Vec<Box<dyn BoxableExpression<_, _, SqlType = _>>>>>()
            .map_or(Err(QuerySubscriptionsError::InvalidFilterError), Ok)?
            .into_iter()
            .fold(
                subscription::table
                    .filter(subscription::owner_id.eq(user_id))
                    .left_join(subscription_event::table)
                    .order_by(subscription::updated_at.desc())
                    .then_order_by(subscription::id.desc())
                    .then_order_by(subscription_event::updated_at.desc())
                    .distinct_on((subscription::updated_at, subscription::id))
                    .into_boxed(),
                |query, item| query.filter(item),
            );

        Ok(query
            .get_results::<(Subscription, Option<SubscriptionEvent>)>(&self.0.get().unwrap())
            .map_err(|e| QuerySubscriptionsError::QueryError(e.into()))?)
    }
}

impl AppState {
    pub fn query_subscriptions<E>(
        &self,
        filter: String,
        user_id: Uuid,
    ) -> impl Future<Item = Vec<(Subscription, Option<SubscriptionEvent>)>, Error = E>
    where
        E: From<QuerySubscriptionsError>,
    {
        self.db
            .send(QuerySubscriptions::new(filter, user_id))
            .from_err()
            .map_err(QuerySubscriptionsError::QueryError)
            .flatten()
            .map_err(|e| e.into())
    }
}
