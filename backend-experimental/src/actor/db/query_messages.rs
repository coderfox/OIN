use super::{DbExecutor, Pagination};
use actix::prelude::{Handler, Message as ActixMessage};
use chrono::{DateTime, Utc};
use diesel::prelude::RunQueryDsl;
use diesel::{BoxableExpression, ExpressionMethods, QueryDsl, TextExpressionMethods};
use futures::Future;
use model::{Message, Subscription};
use state::{AppState, QueryError};
use uuid::Uuid;

pub type QueryMessagesResult = Result<Vec<(Message, Subscription)>, QueryMessageError>;
pub enum QueryMessageError {
    InvalidFilterError,
    QueryError(QueryError),
}

pub struct QueryMessages {
    pub filter: String,
    pub user_id: Uuid,
    pub pagination: Pagination,
}

impl QueryMessages {
    pub fn new(filter: String, user_id: Uuid, pagination: Pagination) -> Self {
        Self {
            filter,
            user_id,
            pagination,
        }
    }
}

impl ActixMessage for QueryMessages {
    type Result = QueryMessagesResult;
}

impl Handler<QueryMessages> for DbExecutor {
    type Result = QueryMessagesResult;

    fn handle(
        &mut self,
        QueryMessages {
            filter,
            user_id,
            pagination,
        }: QueryMessages,
        _: &mut Self::Context,
    ) -> Self::Result {
        use schema::{message, subscription};

        let until_data: Option<(Uuid, DateTime<Utc>)> = pagination.until.and_then(|v| {
            message::table
                .find(v)
                .select((message::id, message::updated_at))
                .get_result(&self.0.get().unwrap())
                .ok()
        });

        let mut query = filter
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
                                "readed" => Some(Box::new(message::readed.eq(v == "true"))),
                                "subscription" => Uuid::parse_str(v)
                                    .map(|v| {
                                        Some(Box::new(message::subscription_id.eq(v))
                                            as Box<dyn BoxableExpression<_, _, SqlType = _>>)
                                    })
                                    .unwrap_or(None),
                                "service" => Uuid::parse_str(v)
                                    .map(|v| {
                                        Some(Box::new(subscription::service_id.eq(v))
                                            as Box<dyn BoxableExpression<_, _, SqlType = _>>)
                                    })
                                    .unwrap_or(None),
                                _ => None,
                            }
                        } else {
                            Some(Box::new(message::title.like(format!("%{}%", ty.unwrap()))))
                        }
                    }
                },
                // TODO: only return fields used
            )
            .collect::<Option<Vec<Box<dyn BoxableExpression<_, _, SqlType = _>>>>>()
            .map_or(Err(QueryMessageError::InvalidFilterError), Ok)?
            .into_iter()
            .fold(
                message::table
                    .inner_join(subscription::table)
                    .limit(pagination.limit as i64)
                    .filter(subscription::owner_id.eq(user_id))
                    .order_by(message::updated_at.desc())
                    .then_order_by(message::id.desc())
                    .into_boxed(),
                |query, item| query.filter(item),
            );
        if let Some((id, updated_at)) = until_data {
            query = query
                .filter(message::updated_at.le(updated_at))
                .filter(message::id.le(id));
        }

        Ok(query
            .get_results::<(Message, Subscription)>(&self.0.get().unwrap())
            .map_err(|e| QueryMessageError::QueryError(e.into()))?)
    }
}

impl AppState {
    pub fn query_messages<E>(
        &self,
        filter: String,
        user_id: Uuid,
        pagination: Pagination,
    ) -> impl Future<Item = Vec<(Message, Subscription)>, Error = E>
    where
        E: From<QueryMessageError>,
    {
        self.db
            .send(QueryMessages::new(filter, user_id, pagination))
            .from_err()
            .map_err(QueryMessageError::QueryError)
            .flatten()
            .map_err(|e| e.into())
    }
}
