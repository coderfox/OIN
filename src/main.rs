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
mod components;
mod db;
mod model;
#[allow(unused_imports)]
mod schema;
mod state;

use actix::prelude::SyncArbiter;
use actix_web::server;
use actor::db::DbExecutor;
use dotenv::dotenv;
use listenfd::ListenFd;

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

    #[cfg(feature = "rest")]
    info!("enabled rest api server at /rest");
    #[cfg(feature = "rpc-client")]
    info!("enabled rpc-client api server at /rpc-client");
    #[cfg(feature = "rpc-crawler")]
    info!("enabled rpc-crawler api server at /rpc-crawler");
    let mut listenfd = ListenFd::from_env();

    let mut server = server::new(move || components::build_app(addr.clone()));

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
