import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSummary1526253571063 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "message" ALTER COLUMN "title" TYPE text;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "message" ALTER COLUMN "title" TYPE character varying(150);`,
    );
  }
}
