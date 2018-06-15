//! Db executor actor
use actix::prelude::*;
use diesel;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};

use error::{ApiError, Result};
use model::{NewUser, User};
use std::env;

pub fn establish_connection() -> ConnectionManager<PgConnection> {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    ConnectionManager::<PgConnection>::new(database_url)
}

pub struct DbExecutor(pub Pool<ConnectionManager<PgConnection>>);

impl Actor for DbExecutor {
    type Context = SyncContext<Self>;
}

struct CreateUser {
    email: String,
    password: String,
    nickname: Option<String>,
}

impl Message for CreateUser {
    type Result = Result<User>;
}

impl Handler<CreateUser> for DbExecutor {
    type Result = Result<User>;

    fn handle(&mut self, msg: CreateUser, _: &mut Self::Context) -> Self::Result {
        use schema::user::dsl::*;

        let new_user = NewUser {
            email: &msg.email,
            password: &msg.password,
            nickname: msg.nickname.as_ref().unwrap_or(&msg.password),
        };

        let conn: &PgConnection = &self.0.get().unwrap();

        // normal diesel operations
        let mut result = diesel::insert_into(user)
            .values(&new_user)
            .get_results(conn)
            .map_err(|e| ApiError::from_error_boxed(Box::new(e)))?;

        Ok(result.pop().unwrap())
    }
}
