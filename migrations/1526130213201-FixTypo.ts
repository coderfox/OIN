import {MigrationInterface, QueryRunner} from "typeorm";

export class FixTypo1526130213201 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "fk_978571afb24326c18bd04262803"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "fk_684f06a81d3f144920b6790c521"`);
        await queryRunner.query(`DROP INDEX "email_unique_without_deletion"`);
        await queryRunner.query(`CREATE TABLE "confirmation" ("id" uuid NOT NULL, "operation" integer NOT NULL, "data" json NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_3eee17867bc79b59e68f5f879fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "permission"`);
        await queryRunner.query(`ALTER TABLE "session" ADD "permission" character varying(10) array NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_30e98e8746699fb9af235410aff" FOREIGN KEY ("user_id") REFERENCES "user"("id")`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_f9d46fa3f655b6cd6a2a4925663" FOREIGN KEY ("owner_id") REFERENCES "user"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_f9d46fa3f655b6cd6a2a4925663"`);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_30e98e8746699fb9af235410aff"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "permission"`);
        await queryRunner.query(`ALTER TABLE "session" ADD "permission" character varying array NOT NULL`);
        await queryRunner.query(`DROP TABLE "confirmation"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "email_unique_without_deletion" ON "user"("email") WHERE (delete_token IS NULL)`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "fk_684f06a81d3f144920b6790c521" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "fk_978571afb24326c18bd04262803" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
