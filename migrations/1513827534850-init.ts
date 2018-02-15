import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1513827534850 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "cofirmation" (
            "id" uuid NOT NULL,
            "operation" integer NOT NULL,
            "data" json NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "expiresAt" TIMESTAMP NOT NULL, PRIMARY KEY("id"))`);
        await queryRunner.query(`CREATE TABLE "session" (
            "token" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "permissions" jsonb NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "expiresAt" TIMESTAMP NOT NULL, "userId" uuid,
            PRIMARY KEY("token"))`);
        await queryRunner.query(`CREATE TABLE "user" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "email" character varying(50) NOT NULL,
            "password" character varying NOT NULL,
            "permissions" jsonb NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "delete_token" uuid, PRIMARY KEY("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "email_unique_with_deletion"
            ON "user"("email","delete_token")`);
        await queryRunner.query(`ALTER TABLE "session"
            ADD CONSTRAINT "fk_befa332be8da6956e9e44a3e39a"
            FOREIGN KEY ("userId") REFERENCES "user"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "fk_befa332be8da6956e9e44a3e39a"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "email_unique_with_deletion"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`DROP TABLE "cofirmation"`);
    }

}
