-- This file should undo anything in `up.sql`
ALTER TABLE "user"
    ADD COLUMN "permission" character varying [ ] NOT NULL DEFAULT ARRAY [ ]::varchar [ ];

ALTER TABLE "session"
    ADD COLUMN "permission" character varying [ ] NOT NULL DEFAULT ARRAY [ ]::varchar [ ];

ALTER TABLE "session" ALTER COLUMN "expires_at" DROP DEFAULT;

ALTER TABLE "message"
    ADD COLUMN "owner_id" uuid REFERENCES "user" (id);

UPDATE
    "message"
SET
    "owner_id" = (
        SELECT
            "owner_id"
        FROM
            "subscription"
        WHERE
            subscription.id = message.subscription_id);

ALTER TABLE "message" ALTER COLUMN "owner_id" SET NOT NULL;

CREATE TABLE "migrations" (
    id integer PRIMARY KEY,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);

CREATE SEQUENCE "migrations_id_seq"
AS integer START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

ALTER SEQUENCE "migrations_id_seq" OWNED BY migrations.id;

INSERT INTO migrations (id, "timestamp", name)
    VALUES (7, 1526199502161, 'Init1526199502161');

INSERT INTO migrations (id, "timestamp", name)
    VALUES (8, 1526253571063, 'UpdateSummary1526253571063');

INSERT INTO migrations (id, "timestamp", name)
    VALUES (9, 1527411501000, 'IntroduceNames1527411501000');

INSERT INTO migrations (id, "timestamp", name)
    VALUES (12, 1527420588643, 'GiveTimezone1527420588643');

INSERT INTO migrations (id, "timestamp", name)
    VALUES (14, 1527588781604, 'CreateSubscriptionEvent1527588781604');

INSERT INTO migrations (id, "timestamp", name)
    VALUES (15, 1527589194465, 'ForeignKeysNotNull1527589194465');

SELECT
    pg_catalog.setval('public.migrations_id_seq',
        15,
        TRUE);

ALTER TABLE ONLY "migrations" ALTER COLUMN id SET DEFAULT nextval('migrations_id_seq'::regclass);

