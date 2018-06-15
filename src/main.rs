extern crate actix;
extern crate actix_web;
extern crate chrono;
extern crate dotenv;
extern crate r2d2;
extern crate uuid;

#[macro_use]
extern crate diesel;
#[macro_use]
extern crate diesel_migrations;

mod db;
mod error;
mod model;
mod schema;
mod state;

use actix::prelude::*;
use actix_web::{server, App, HttpRequest};
use db::DbExecutor;
use dotenv::dotenv;
use state::AppState;

embed_migrations!();

fn index(_req: HttpRequest<AppState>) -> &'static str {
    "Hello world!"
}

fn main() {
    dotenv().ok();

    let sys = actix::System::new("diesel-example");

    // Start 3 db executor actors
    let pool = r2d2::Pool::builder()
        .build(db::establish_connection())
        .expect("Failed to create pool.");

    embedded_migrations::run_with_output(
        &pool.get().expect("Failed to connect to database."),
        &mut std::io::stdout(),
    ).expect("run migration failed");

    let addr = SyncArbiter::start(3, move || DbExecutor(pool.clone()));

    server::new(move || {
        App::with_state(AppState { db: addr.clone() }).resource("/", |r| r.f(index))
    }).bind("127.0.0.1:8088")
        .unwrap()
        .start();

    println!("Started http server: 127.0.0.1:8080");
    let _ = sys.run();
}
