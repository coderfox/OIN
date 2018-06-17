use actix::prelude::{Actor, SyncContext};
use diesel::prelude::PgConnection;
use diesel::r2d2::{ConnectionManager, Pool};
use std::env;

pub fn establish_connection() -> ConnectionManager<PgConnection> {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    info!("connecting to database {}", database_url);
    ConnectionManager::<PgConnection>::new(database_url)
}

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
