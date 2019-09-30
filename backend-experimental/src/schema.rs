table! {
    use model::Permission;
    use diesel::sql_types::*;

    message (id) {
        id -> Uuid,
        readed -> Bool,
        title -> Text,
        summary -> Text,
        content -> Text,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        subscription_id -> Uuid,
        href -> Nullable<Varchar>,
    }
}

table! {
    use model::Permission;
    use diesel::sql_types::*;

    service (id) {
        id -> Uuid,
        name -> Varchar,
        token -> Uuid,
        description -> Nullable<Varchar>,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

table! {
    use model::Permission;
    use diesel::sql_types::*;

    session (token) {
        token -> Uuid,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        expires_at -> Timestamptz,
        user_id -> Uuid,
        permissions -> Array<Permission>,
    }
}

table! {
    use model::Permission;
    use diesel::sql_types::*;

    subscription (id) {
        id -> Uuid,
        config -> Text,
        deleted -> Bool,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        owner_id -> Uuid,
        service_id -> Uuid,
        name -> Varchar,
    }
}

table! {
    use model::Permission;
    use diesel::sql_types::*;

    subscription_event (id) {
        id -> Uuid,
        status -> Bool,
        message -> Varchar,
        updated_at -> Timestamptz,
        subscription_id -> Uuid,
    }
}

table! {
    use model::Permission;
    use diesel::sql_types::*;

    user (id) {
        id -> Uuid,
        email -> Varchar,
        password -> Varchar,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        delete_token -> Nullable<Uuid>,
        nickname -> Varchar,
        permissions -> Array<Permission>,
    }
}

joinable!(message -> subscription (subscription_id));
joinable!(session -> user (user_id));
joinable!(subscription -> service (service_id));
joinable!(subscription -> user (owner_id));
joinable!(subscription_event -> subscription (subscription_id));

allow_tables_to_appear_in_same_query!(
    message,
    service,
    session,
    subscription,
    subscription_event,
    user,
);
