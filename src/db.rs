//! Db executor actor
use actix::prelude::*;
use diesel;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use diesel::result::Error;

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

pub struct CreateUser {
    pub email: String,
    pub password: String,
    pub nickname: Option<String>,
}

impl Message for CreateUser {
    type Result = Result<User, Error>;
}

impl Handler<CreateUser> for DbExecutor {
    type Result = Result<User, Error>;

    fn handle(&mut self, msg: CreateUser, _: &mut Self::Context) -> Self::Result {
        use schema::user::dsl::*;

        let new_user = NewUser {
            email: &msg.email,
            password: &msg.password,
            nickname: msg.nickname.as_ref().unwrap_or(&msg.email),
        };

        let conn: &PgConnection = &self.0.get().unwrap();

        // normal diesel operations
        let result = diesel::insert_into(user)
            .values(&new_user)
            .get_result(conn)?;

        Ok(result)
    }
}
