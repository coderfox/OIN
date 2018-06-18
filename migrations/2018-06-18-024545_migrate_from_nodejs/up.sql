-- Your SQL goes here
ALTER TABLE "user" DROP COLUMN "permission";

ALTER TABLE "session" DROP COLUMN "permission";

ALTER TABLE "session" ALTER COLUMN "expires_at" SET DEFAULT now() + '7 days'::interval;

ALTER TABLE "message" DROP COLUMN "owner_id";

DROP TABLE "migrations";

