use actix::prelude::{Actor, SyncContext};
use diesel;
use diesel::prelude::PgConnection;
use diesel::r2d2::{ConnectionManager, Pool};
use futures::Future;
use state::QueryError;
use uuid::Uuid;

mod create_user;
pub use self::create_user::*;

mod query;
pub use self::query::*;

mod query_single;
pub use self::query_single::*;

mod query_messages;
pub use self::query_messages::*;

mod query_subscriptions;
pub use self::query_subscriptions::*;

pub struct DbExecutor(pub Pool<ConnectionManager<PgConnection>>);

impl Actor for DbExecutor {
    type Context = SyncContext<Self>;
}

pub struct Pagination {
    pub limit: usize,
    pub until: Option<Uuid>,
}

pub trait ActorQuery<Q, R, E>
where
    Q: 'static
        + diesel::RunQueryDsl<PgConnection>
        + diesel::query_builder::Query
        + diesel::query_builder::QueryId
        + diesel::query_builder::QueryFragment<diesel::pg::Pg>
        + Send,
    diesel::pg::Pg: diesel::sql_types::HasSqlType<<Q as diesel::query_builder::Query>::SqlType>,
    E: From<QueryError>,
{
    type Future: Future<Item = R, Error = E>;
    fn query(&self, query: Q) -> Self::Future;
}
