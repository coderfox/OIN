table! {
    session (token) {
        token -> Uuid,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        expires_at -> Timestamptz,
        user_id -> Uuid,
    }
}

table! {
    user (id) {
        id -> Uuid,
        email -> Varchar,
        password -> Varchar,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        delete_token -> Nullable<Uuid>,
        nickname -> Varchar,
    }
}

joinable!(session -> user (user_id));

allow_tables_to_appear_in_same_query!(session, user,);
