ALTER TABLE "subscription" ALTER COLUMN "deleted" SET DEFAULT FALSE;

SELECT
    diesel_manage_updated_at ('message'),
    diesel_manage_updated_at ('service'),
    diesel_manage_updated_at ('session'),
    diesel_manage_updated_at ('subscription'),
    diesel_manage_updated_at ('subscription_event'),
    diesel_manage_updated_at ('user');

