// TODO: email notifications
// TODO: tests

#![deny(bare_trait_objects)]

extern crate actix;
extern crate actix_web;
extern crate base64;
extern crate bcrypt;
extern crate chrono;
extern crate dotenv;
extern crate failure;
extern crate futures;
#[cfg(feature = "listenfd")]
extern crate listenfd;
extern crate num_cpus;
#[cfg(feature = "pretty_env_logger")]
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
#[cfg(feature = "sentry")]
#[macro_use]
extern crate sentry;
#[macro_use]
extern crate lazy_static;

mod actor;
mod components;
mod config;
mod db;
mod model;
#[allow(unused_imports)]
mod schema;
mod state;

use actix::prelude::SyncArbiter;
use actix_web::server;
use actor::db::DbExecutor;
use dotenv::dotenv;
#[cfg(feature = "listenfd")]
use listenfd::ListenFd;
#[cfg(feature = "sentry")]
use sentry::integrations::panic::register_panic_handler;

#[cfg(not(feature = "listenfd"))]
fn bind_server<T>(server: actix_web::server::HttpServer<T>) -> actix_web::server::HttpServer<T>
where
    T: actix_web::server::IntoHttpHandler,
{
    server
        .bind(std::env::var("BIND_ADDRESS").unwrap_or("[::]:3000".to_string()))
        .unwrap()
}
#[cfg(feature = "listenfd")]
fn bind_server<T>(server: actix_web::server::HttpServer<T>) -> actix_web::server::HttpServer<T>
where
    T: actix_web::server::IntoHttpHandler,
{
    let mut listenfd = ListenFd::from_env();
    if let Some(l) = listenfd.take_tcp_listener(0).unwrap() {
        server.listen(l)
    } else {
        server
            .bind(std::env::var("BIND_ADDRESS").unwrap_or("[::]:3000".to_string()))
            .unwrap()
    }
}

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
    #[cfg(feature = "pretty_env_logger")]
    pretty_env_logger::init();

    #[cfg(feature = "rest")]
    info!("enabled rest api server at /rest");
    #[cfg(feature = "rpc-client")]
    info!("enabled rpc-client api server at /rpc-client");
    #[cfg(feature = "rpc-crawler")]
    info!("enabled rpc-crawler api server at /rpc-crawler");
    #[cfg(feature = "fallback-app")]
    info!("enabled fallback app");
    #[cfg(feature = "listenfd")]
    info!("enabled listenfd binding");
    #[cfg(feature = "sentry")]
    info!("enabled sentry report");
    #[cfg(feature = "pretty_env_logger")]
    info!("enabled pretty_env_logger");

    #[cfg(feature = "sentry")]
    sentry::init((
        std::env::var("SENTRY_DSL").expect("SENTRY_DSL is not set"),
        sentry::ClientOptions {
            release: sentry_crate_release!(),
            ..Default::default()
        },
    ));
    #[cfg(feature = "sentry")]
    register_panic_handler();
    #[cfg(feature = "sentry")]
    std::env::set_var("RUST_BACKTRACE", "1");

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

    let mut server = server::new(move || components::build_app(addr.clone()));

    server = bind_server(server);

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
