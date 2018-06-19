use super::DbExecutor;
use actix::prelude::{Handler, Message};
use diesel;
use diesel::prelude::{PgConnection, Queryable, RunQueryDsl};
use diesel::result::Error as DieselError;
use futures::Future;
use state::{AppState, QueryError};
use std::marker::PhantomData;

pub type QueryResult<T> = Result<Vec<T>, DieselError>;

pub struct Query<T, R>
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

impl<T, R> Query<T, R>
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

impl<T, R> Message for Query<T, R>
where
    T: RunQueryDsl<PgConnection>
        + diesel::query_builder::Query
        + diesel::query_builder::QueryId
        + diesel::query_builder::QueryFragment<diesel::pg::Pg>,
    R: 'static + Queryable<<T as diesel::query_builder::Query>::SqlType, diesel::pg::Pg>,
    diesel::pg::Pg: diesel::sql_types::HasSqlType<<T as diesel::query_builder::Query>::SqlType>,
{
    type Result = QueryResult<R>;
}

impl<T, R> Handler<Query<T, R>> for DbExecutor
where
    T: RunQueryDsl<PgConnection>
        + diesel::query_builder::Query
        + diesel::query_builder::QueryId
        + diesel::query_builder::QueryFragment<diesel::pg::Pg>,
    R: 'static + Queryable<<T as diesel::query_builder::Query>::SqlType, diesel::pg::Pg>,
    diesel::pg::Pg: diesel::sql_types::HasSqlType<<T as diesel::query_builder::Query>::SqlType>,
{
    type Result = QueryResult<R>;

    fn handle(&mut self, msg: Query<T, R>, _: &mut Self::Context) -> Self::Result {
        // normal diesel operations
        let result = msg.query.get_results::<R>(&self.0.get().unwrap())?;

        Ok(result)
    }
}

impl AppState {
    pub fn query<T, R, E>(&self, query: T) -> impl Future<Item = Vec<R>, Error = E>
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
        self.db
            .send(Query::new(query))
            .from_err()
            .and_then(|f| f.map_err(|e| e.into()))
            .map_err(|e: QueryError| e.into())
    }
}
