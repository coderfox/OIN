#![allow(unused_imports)] // TODO:UPSTREAM remove this after diesel_migrations update

use diesel::r2d2::ConnectionManager;
use diesel::PgConnection;
use r2d2::Pool;
use std::env;
use std::io::stdout;

embed_migrations!();

pub fn run_migrations(pool: &Pool<ConnectionManager<PgConnection>>) {
    embedded_migrations::run_with_output(
        &pool.get().expect("Failed to connect to database."),
        &mut stdout(),
    ).expect("run migration failed");
    info!("database migrations executed successfully");
}

pub fn establish_connection() -> ConnectionManager<PgConnection> {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    info!("connecting to database {}", database_url);
    ConnectionManager::<PgConnection>::new(database_url)
}
