use actix::{Addr, Syn};
use actor::db::DbExecutor;

pub struct AppState {
    pub db: Addr<Syn, DbExecutor>,
}
