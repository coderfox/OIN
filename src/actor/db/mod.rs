use actix::prelude::{Actor, SyncContext};
use diesel::prelude::PgConnection;
use diesel::r2d2::{ConnectionManager, Pool};
use uuid::Uuid;

pub struct DbExecutor(pub Pool<ConnectionManager<PgConnection>>);

impl Actor for DbExecutor {
    type Context = SyncContext<Self>;
}

pub struct Pagination {
    pub limit: usize,
    pub until: Option<Uuid>,
}

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
