import { MigrationInterface, QueryRunner } from "typeorm";

export class Message1513934299276 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "message" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "readed" boolean NOT NULL,
            "subscription" uuid NOT NULL,
            "title" character varying(150) NOT NULL,
            "abstract" text NOT NULL,
            "content_type" character varying NOT NULL,
            "content" text NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "ownerId" uuid,
            PRIMARY KEY("id"))`);
        await queryRunner.query(`ALTER TABLE "message"
        ADD CONSTRAINT "fk_c39f3f3b187c194fe5a05161da2"
        FOREIGN KEY ("ownerId")
        REFERENCES "user"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "fk_c39f3f3b187c194fe5a05161da2"`);
        await queryRunner.query(`DROP TABLE "message"`);
    }

}
