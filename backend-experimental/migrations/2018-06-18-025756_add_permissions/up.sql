-- Your SQL goes here
CREATE TYPE permission AS ENUM ( 'admin'
);

ALTER TABLE "user"
    ADD COLUMN "permissions" permission [ ] NOT NULL DEFAULT ARRAY [ ]::permission [ ];

ALTER TABLE "session"
    ADD COLUMN "permissions" permission [ ] NOT NULL DEFAULT ARRAY [ ]::permission [ ];

