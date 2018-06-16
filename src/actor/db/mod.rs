use actix::prelude::*;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use std::env;

pub fn establish_connection() -> ConnectionManager<PgConnection> {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    ConnectionManager::<PgConnection>::new(database_url)
}

pub struct DbExecutor(pub Pool<ConnectionManager<PgConnection>>);

impl Actor for DbExecutor {
    type Context = SyncContext<Self>;
}

mod create_user;
pub use self::create_user::*;
