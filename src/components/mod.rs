#[cfg(feature = "rest")]
mod rest;
#[cfg(feature = "rpc-client")]
mod rpc_client;
#[cfg(feature = "rpc-crawler")]
mod rpc_crawler;

mod logger;
use self::logger::LogError;

use actix::prelude::{Addr, Syn};
use actix_web::App;
use actor::db::DbExecutor;
use state::AppState;

pub fn build_app(addr: Addr<Syn, DbExecutor>) -> Vec<App<AppState>> {
    let mut vec = Vec::new();
    #[cfg(feature = "rest")]
    vec.push(rest::build_app(addr.clone()));
    #[cfg(feature = "rpc-client")]
    vec.push(rpc_client::build_app(addr.clone()));
    #[cfg(feature = "rpc-crawler")]
    vec.push(rpc_crawler::build_app(addr.clone()));
    #[cfg(feature = "fallback-app")]
    vec.push(build_fallback_app(addr.clone()));
    vec
}

#[cfg(feature = "fallback-app")]
pub fn build_fallback_app(addr: Addr<Syn, DbExecutor>) -> App<AppState> {
    use actix_web::{middleware::DefaultHeaders, HttpRequest, HttpResponse};
    App::with_state(AppState { db: addr })
        .middleware(DefaultHeaders::new().header("Server", "sandra-backend/0.3.0"))
        .middleware(LogError)
        .default_resource(|r| r.f(|_: HttpRequest<AppState>| HttpResponse::BadRequest()))
}
