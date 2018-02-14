import { MigrationInterface, QueryRunner } from "typeorm";

export class Service1518565960634 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "service" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying(50) NOT NULL,
            "token" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "description" character varying NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            PRIMARY KEY("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "service"`);
    }

}
