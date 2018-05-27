import { MigrationInterface, QueryRunner } from "typeorm";

export class IntroduceNames1527411501000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "subscription" ADD "name" character varying`);
        await queryRunner.query(`ALTER TABLE "message" ADD "href" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "nickname" character varying`);
        await queryRunner.query(`UPDATE "subscription" SET "name"="id"`)
        await queryRunner.query(`UPDATE "user" SET "nickname"="email"`)
        await queryRunner.query(`ALTER TABLE "subscription" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "nickname" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "nickname"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "href"`);
        await queryRunner.query(`ALTER TABLE "subscription" DROP COLUMN "name"`);
    }

}
