import { MigrationInterface, QueryRunner } from "typeorm";

export class EmailUnique1513838016475 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE UNIQUE INDEX email_unique_without_deletion
        ON "user" (email) WHERE delete_token ISNULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX IF EXISTS "email_unique_without_deletion"`);
    }

}
