use actix::{Addr, MailboxError, Syn};
use actor::db::DbExecutor;
use diesel::result::Error as DieselError;

pub struct AppState {
    pub db: Addr<Syn, DbExecutor>,
}

pub enum QueryError {
    ActixError(MailboxError),
    DieselError(DieselError),
}

impl From<MailboxError> for QueryError {
    fn from(err: MailboxError) -> Self {
        QueryError::ActixError(err)
    }
}

impl From<DieselError> for QueryError {
    fn from(err: DieselError) -> Self {
        QueryError::DieselError(err)
    }
}
