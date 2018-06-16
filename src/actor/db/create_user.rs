use super::DbExecutor;
use actix::prelude::*;
use bcrypt::BcryptError;
use diesel;
use diesel::prelude::*;
use diesel::result::Error as DieselError;
use model::{NewUser, User};
use std::error::Error;
use std::fmt;

#[derive(Debug)]
pub enum CreateUserError {
    DieselError(DieselError),
    BcryptError(BcryptError),
}

impl fmt::Display for CreateUserError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        use self::CreateUserError::*;
        write!(
            f,
            "{}",
            match self {
                DieselError(e) => format!("diesel: {}", e.description()),
                BcryptError(e) => format!("bcrypt: {}", e.description()),
            }
        )
    }
}

impl Error for CreateUserError {
    fn description(&self) -> &str {
        use self::CreateUserError::*;
        match self {
            DieselError(e) => e.description(),
            BcryptError(e) => e.description(),
        }
    }

    fn cause(&self) -> Option<&Error> {
        use self::CreateUserError::*;
        match self {
            DieselError(e) => Some(e),
            BcryptError(e) => Some(e),
        }
    }
}

pub struct CreateUser {
    pub email: String,
    pub password: String,
    pub nickname: Option<String>,
}

impl Message for CreateUser {
    type Result = Result<User, CreateUserError>;
}

impl Handler<CreateUser> for DbExecutor {
    type Result = Result<User, CreateUserError>;

    fn handle(&mut self, msg: CreateUser, _: &mut Self::Context) -> Self::Result {
        use schema::user::dsl::user;

        let nickname = msg.nickname.unwrap_or(msg.email.clone());
        let new_user = NewUser::new(&msg.email, &msg.password, &nickname)
            .map_err(|e| CreateUserError::BcryptError(e))?;

        let conn: &PgConnection = &self.0.get().unwrap();

        // normal diesel operations
        let result = diesel::insert_into(user)
            .values(&new_user)
            .get_result(conn)
            .map_err(|e| CreateUserError::DieselError(e))?;

        Ok(result)
    }
}
