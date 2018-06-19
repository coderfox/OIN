-- Your SQL goes here
ALTER TABLE "user" DROP COLUMN "permission";

ALTER TABLE "session" DROP COLUMN "permission";

ALTER TABLE "session" ALTER COLUMN "expires_at" SET DEFAULT now() + '7 days'::interval;

ALTER TABLE "message" DROP COLUMN "owner_id";

DROP TABLE "migrations";

SELECT
    diesel_manage_updated_at ('message'),
    diesel_manage_updated_at ('service'),
    diesel_manage_updated_at ('session'),
    diesel_manage_updated_at ('subscription'),
    diesel_manage_updated_at ('subscription_event'),
    diesel_manage_updated_at ('user');

