extern crate actix;
extern crate actix_web;
extern crate bcrypt;
extern crate chrono;
extern crate dotenv;
extern crate failure;
extern crate futures;
extern crate listenfd;
extern crate r2d2;
extern crate serde;
extern crate uuid;

#[macro_use]
extern crate diesel;
#[macro_use]
extern crate diesel_migrations;
#[macro_use]
extern crate serde_derive;

mod actor;
mod model;
mod response;
mod route;
mod schema;
mod state;

use actix::prelude::*;
use actix_web::middleware::ErrorHandlers;
use actix_web::{http, server, App};
use actor::db::DbExecutor;
use dotenv::dotenv;
use listenfd::ListenFd;
use state::AppState;

embed_migrations!();

fn main() {
    dotenv().ok();

    let sys = actix::System::new("diesel-example");

    // Start 3 db executor actors
    let pool = r2d2::Pool::builder()
        .build(actor::db::establish_connection())
        .expect("Failed to create pool.");

    embedded_migrations::run_with_output(
        &pool.get().expect("Failed to connect to database."),
        &mut std::io::stdout(),
    ).expect("run migration failed");

    let addr = SyncArbiter::start(3, move || DbExecutor(pool.clone()));

    let mut listenfd = ListenFd::from_env();

    let mut server = server::new(move || {
        App::with_state(AppState { db: addr.clone() })
            .middleware(route::LogError)
            .middleware(
                ErrorHandlers::new()
                    .handler(
                        http::StatusCode::INTERNAL_SERVER_ERROR,
                        route::error::render_500,
                    )
                    .handler(http::StatusCode::BAD_REQUEST, route::error::render_400)
                    .handler(http::StatusCode::NOT_FOUND, route::error::render_404),
            )
            .resource("/users", |r| {
                r.post().with(route::users::post_all);
            })
            .default_resource(|r| r.f(route::default_route))
    });

    server = if let Some(l) = listenfd.take_tcp_listener(0).unwrap() {
        server.listen(l)
    } else {
        server
            .bind(std::env::var("BIND_ADDRESS").unwrap_or("[::]:3000".to_string()))
            .unwrap()
    };

    println!("Started http server: {:?}", server.addrs());
    server.start();

    let _ = sys.run();
}
