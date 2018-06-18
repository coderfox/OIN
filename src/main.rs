extern crate actix;
extern crate actix_web;
extern crate base64;
extern crate bcrypt;
extern crate chrono;
extern crate dotenv;
extern crate failure;
extern crate futures;
extern crate listenfd;
extern crate num_cpus;
extern crate pretty_env_logger;
extern crate r2d2;
extern crate serde;
extern crate uuid;

#[macro_use]
extern crate diesel;
#[macro_use]
extern crate diesel_migrations;
#[macro_use]
extern crate log;
#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate diesel_derive_enum;

mod actor;
mod auth;
mod db;
mod model;
mod response;
mod route;
#[allow(unused_imports)]
mod schema;
mod state;

use actix::prelude::*;
use actix_web::middleware::{self, ErrorHandlers};
use actix_web::{http, server, App};
use actor::db::DbExecutor;
use dotenv::dotenv;
use listenfd::ListenFd;
use state::AppState;

fn main() {
    dotenv().ok();

    std::env::set_var(
        "RUST_LOG",
        format!(
            "{},sandra_backend={}",
            std::env::var("RUST_LOG").unwrap_or("".to_string()),
            std::env::var("SANDRA_LOG").unwrap_or("info".to_string())
        ),
    );
    // log level in increasing order: trace! debug! info! warn! error!
    pretty_env_logger::init();

    let sys = actix::System::new("sandra");

    let pool = r2d2::Pool::builder()
        .build(db::establish_connection())
        .expect("Failed to create pool.");

    db::run_migrations(&pool);

    let addr = SyncArbiter::start(
        std::env::var("DBEXECUTOR_COUNT")
            .unwrap_or(num_cpus::get().to_string())
            .parse()
            .expect("invalid value for DBEXECUTOR_COUNT"),
        move || DbExecutor(pool.clone()),
    );

    let mut listenfd = ListenFd::from_env();

    let mut server = server::new(move || {
        App::with_state(AppState { db: addr.clone() })
            .middleware(middleware::DefaultHeaders::new().header(
                "Server",
                "sandra-backend/0.3.0 (REST/0.4.3; RPC Crawler/0.4.0)",
            ))
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
            .configure(|app| {
                middleware::cors::Cors::for_app(app)
                    .supports_credentials()
                    .resource("/users", |r| {
                        r.post().with(route::users::post_all);
                    })
                    .resource("/users/me", |r| {
                        r.get().with(route::users::get_me);
                    })
                    .resource("/session", |r| {
                        r.name("session");
                        r.put().with(route::session::post);
                        r.get().with(route::session::get);
                        r.delete().with(route::session::delete);
                    })
                    .register()
            })
    });

    server = if let Some(l) = listenfd.take_tcp_listener(0).unwrap() {
        server.listen(l)
    } else {
        server
            .bind(std::env::var("BIND_ADDRESS").unwrap_or("[::]:3000".to_string()))
            .unwrap()
    };

    info!(
        "server listening on {}",
        server
            .addrs_with_scheme()
            .iter()
            .map(|&(a, s)| format!("{}://{}", s, a))
            .collect::<Vec<String>>()
            .join(", ")
    );

    server.start();

    let _ = sys.run();
}
