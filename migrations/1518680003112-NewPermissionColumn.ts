import { MigrationInterface, QueryRunner } from "typeorm";

export class NewPermissionColumn1518680003112 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."session" DROP "permissions"`);
        await queryRunner.query(`ALTER TABLE "public"."user" DROP "permissions"`);
        await queryRunner.query(`ALTER TABLE "public"."session" ADD "permission" character varying array NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "permission" character varying array NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."user" DROP "permission"`);
        await queryRunner.query(`ALTER TABLE "public"."session" DROP "permission"`);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "permissions" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."session" ADD "permissions" jsonb NOT NULL`);
    }

}
