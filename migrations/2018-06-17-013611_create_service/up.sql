-- Table Definition ----------------------------------------------
CREATE TABLE service (
    id uuid PRIMARY KEY,
    name character varying (50) NOT NULL,
    token uuid NOT NULL DEFAULT uuid_generate_v4 () UNIQUE,
    description character varying,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

--- Diesel Managed updated_at ------------------------------------
SELECT
    diesel_manage_updated_at ('service');

