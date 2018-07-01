use super::DbExecutor;
use actix::prelude::{Handler, Message as ActixMessage};
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
}

impl QueryMessages {
    pub fn new(filter: String, user_id: Uuid) -> Self {
        Self { filter, user_id }
    }
}

impl ActixMessage for QueryMessages {
    type Result = QueryMessagesResult;
}

impl Handler<QueryMessages> for DbExecutor {
    type Result = QueryMessagesResult;

    fn handle(
        &mut self,
        QueryMessages { filter, user_id }: QueryMessages,
        _: &mut Self::Context,
    ) -> Self::Result {
        use schema::{message, subscription};

        let query = filter
            .split(" ")
            .into_iter()
            .map(
                |filter| -> Option<Box<BoxableExpression<_, _, SqlType = _>>> {
                    let mut parts = filter.split(":");
                    let ty = parts.next();
                    let val = parts.next();
                    if ty == None {
                        None
                    } else {
                        if let Some(v) = val {
                            match ty.unwrap() {
                                "readed" => Some(Box::new(message::readed.eq(v == "true"))),
                                "subsciption" => Uuid::parse_str(v)
                                    .map(|v| {
                                        Some(Box::new(message::subscription_id.eq(v))
                                            as Box<BoxableExpression<_, _, SqlType = _>>)
                                    })
                                    .unwrap_or(None),
                                //Some(Box::new(
                                //    message::subscription_id.eq(Uuid::parse_str(v).unwrap()),
                                //)),
                                "service" => Uuid::parse_str(v)
                                    .map(|v| {
                                        Some(Box::new(subscription::service_id.eq(v))
                                            as Box<BoxableExpression<_, _, SqlType = _>>)
                                    })
                                    .unwrap_or(None),
                                _ => None, // error
                            }
                        } else {
                            Some(Box::new(message::title.like(ty.unwrap())))
                        }
                    }
                },
                // TODO: only return fields used
            )
            .collect::<Option<Vec<Box<BoxableExpression<_, _, SqlType = _>>>>>()
            .map_or(Err(QueryMessageError::InvalidFilterError), Ok)?
            .into_iter()
            .fold(
                message::table
                    .inner_join(subscription::table)
                    .filter(subscription::owner_id.eq(user_id))
                    .into_boxed(),
                |query, item| query.filter(item),
            );

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
    ) -> impl Future<Item = Vec<(Message, Subscription)>, Error = E>
    where
        E: From<QueryMessageError>,
    {
        self.db
            .send(QueryMessages::new(filter, user_id))
            .from_err()
            .map_err(QueryMessageError::QueryError)
            .flatten()
            .map_err(|e| e.into())
    }
}
