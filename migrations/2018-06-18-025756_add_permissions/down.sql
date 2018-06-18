-- This file should undo anything in `up.sql`
ALTER TABLE "user" DROP COLUMN IF EXISTS "permissions";

ALTER TABLE "session" DROP COLUMN IF EXISTS "permissions";

DROP TYPE permission;

