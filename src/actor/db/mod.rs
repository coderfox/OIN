use actix::prelude::{Actor, SyncContext};
use diesel::prelude::PgConnection;
use diesel::r2d2::{ConnectionManager, Pool};

pub struct DbExecutor(pub Pool<ConnectionManager<PgConnection>>);

impl Actor for DbExecutor {
    type Context = SyncContext<Self>;
}

mod create_user;
pub use self::create_user::*;

mod query;
pub use self::query::*;

mod query_single;
pub use self::query_single::*;

mod query_messages;
pub use self::query_messages::*;
