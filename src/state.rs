use actix::{Addr, MailboxError, Syn};
use actix_web::State as ActixState;
use actor::db::DbExecutor;
use diesel::result::Error as DieselError;

pub type State = ActixState<AppState>;

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
