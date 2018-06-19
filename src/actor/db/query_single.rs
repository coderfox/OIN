use super::DbExecutor;
use actix::prelude::{Handler, Message};
use diesel;
use diesel::prelude::{PgConnection, Queryable, RunQueryDsl};
use diesel::result::Error as DieselError;
use futures::Future;
use state::{AppState, QueryError};
use std::marker::PhantomData;

pub type QuerySingleResult<T> = Result<T, DieselError>;

pub struct QuerySingle<T, R>
where
    T: RunQueryDsl<PgConnection>
        + diesel::query_builder::Query
        + diesel::query_builder::QueryId
        + diesel::query_builder::QueryFragment<diesel::pg::Pg>,
    R: 'static + Queryable<<T as diesel::query_builder::Query>::SqlType, diesel::pg::Pg>,
    diesel::pg::Pg: diesel::sql_types::HasSqlType<<T as diesel::query_builder::Query>::SqlType>,
{
    pub query: T,
    pub _phantom: PhantomData<R>,
}

impl<T, R> QuerySingle<T, R>
where
    T: RunQueryDsl<PgConnection>
        + diesel::query_builder::Query
        + diesel::query_builder::QueryId
        + diesel::query_builder::QueryFragment<diesel::pg::Pg>,
    R: 'static + Queryable<<T as diesel::query_builder::Query>::SqlType, diesel::pg::Pg>,
    diesel::pg::Pg: diesel::sql_types::HasSqlType<<T as diesel::query_builder::Query>::SqlType>,
{
    pub fn new(query: T) -> Self {
        Self {
            query,
            _phantom: PhantomData::<R>,
        }
    }
}

impl<T, R> Message for QuerySingle<T, R>
where
    T: RunQueryDsl<PgConnection>
        + diesel::query_builder::Query
        + diesel::query_builder::QueryId
        + diesel::query_builder::QueryFragment<diesel::pg::Pg>,
    R: 'static + Queryable<<T as diesel::query_builder::Query>::SqlType, diesel::pg::Pg>,
    diesel::pg::Pg: diesel::sql_types::HasSqlType<<T as diesel::query_builder::Query>::SqlType>,
{
    type Result = QuerySingleResult<R>;
}

impl<T, R> Handler<QuerySingle<T, R>> for DbExecutor
where
    T: RunQueryDsl<PgConnection>
        + diesel::query_builder::Query
        + diesel::query_builder::QueryId
        + diesel::query_builder::QueryFragment<diesel::pg::Pg>,
    R: 'static + Queryable<<T as diesel::query_builder::Query>::SqlType, diesel::pg::Pg>,
    diesel::pg::Pg: diesel::sql_types::HasSqlType<<T as diesel::query_builder::Query>::SqlType>,
{
    type Result = QuerySingleResult<R>;

    fn handle(&mut self, msg: QuerySingle<T, R>, _: &mut Self::Context) -> Self::Result {
        // normal diesel operations
        let result = msg.query.get_result::<R>(&self.0.get().unwrap())?;

        Ok(result)
    }
}

impl AppState {
    pub fn query_single<T, R, E>(&self, query: T) -> Box<Future<Item = R, Error = E>>
    where
        T: 'static
            + RunQueryDsl<PgConnection>
            + diesel::query_builder::Query
            + diesel::query_builder::QueryId
            + diesel::query_builder::QueryFragment<diesel::pg::Pg>
            + Send,
        R: 'static + Queryable<<T as diesel::query_builder::Query>::SqlType, diesel::pg::Pg> + Send,
        diesel::pg::Pg: diesel::sql_types::HasSqlType<<T as diesel::query_builder::Query>::SqlType>,
        E: From<QueryError>,
    {
        Box::new(
            self.db
                .send(QuerySingle::new(query))
                .from_err()
                .and_then(|f| f.map_err(|e| e.into()))
                .map_err(|e: QueryError| e.into()),
        )
    }
}
