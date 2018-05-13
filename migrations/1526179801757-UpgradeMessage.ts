import {MigrationInterface, QueryRunner} from "typeorm";

export class UpgradeMessage1526179801757 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "abstract"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "content_type"`);
        await queryRunner.query(`ALTER TABLE "message" ADD "summary" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "permission"`);
        await queryRunner.query(`ALTER TABLE "session" ADD "permission" character varying(10) array NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "permission"`);
        await queryRunner.query(`ALTER TABLE "session" ADD "permission" character varying array NOT NULL`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "summary"`);
        await queryRunner.query(`ALTER TABLE "message" ADD "content_type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "message" ADD "abstract" text NOT NULL`);
    }

}
