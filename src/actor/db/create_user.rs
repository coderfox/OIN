use super::DbExecutor;
use actix::prelude::*;
use diesel;
use diesel::prelude::*;
use diesel::result::Error;
use model::{NewUser, User};

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
            nickname: &msg.nickname.unwrap_or(msg.email.clone()),
        };

        let conn: &PgConnection = &self.0.get().unwrap();

        // normal diesel operations
        let result = diesel::insert_into(user)
            .values(&new_user)
            .get_result(conn)?;

        Ok(result)
    }
}
