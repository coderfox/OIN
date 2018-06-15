use actix::{Addr, Syn};
use db::DbExecutor;

pub struct AppState {
    pub db: Addr<Syn, DbExecutor>,
}
