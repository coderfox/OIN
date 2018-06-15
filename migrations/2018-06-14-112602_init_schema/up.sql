-- extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

-- Table Definition ----------------------------------------------
CREATE TABLE "user" (
    id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
    email character varying (50) NOT NULL,
    "password" character varying NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    delete_token uuid,
    nickname character varying NOT NULL
);

-- Indices -------------------------------------------------------
CREATE UNIQUE INDEX email_unique_with_deletion ON "user" (email text_ops, delete_token uuid_ops);

CREATE UNIQUE INDEX email_unique_without_deletion ON "user" (email text_ops)
WHERE
    delete_token IS NULL;

-- Table Definition ----------------------------------------------
CREATE TABLE "session" (
    token uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    user_id uuid NOT NULL REFERENCES "user" (id)
);

--- Diesel Managed updated_at ------------------------------------
SELECT
    diesel_manage_updated_at ('session'),
    diesel_manage_updated_at ('user');

