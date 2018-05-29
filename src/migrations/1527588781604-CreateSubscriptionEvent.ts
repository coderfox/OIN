import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateSubscriptionEvent1527588781604 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "subscription_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" boolean NOT NULL, "message" character varying NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "subscription_id" uuid, CONSTRAINT "PK_878b79ef455c948db7f94615990" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subscription_event" ADD CONSTRAINT "FK_9aefe091450823da119950f3290" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "subscription_event" DROP CONSTRAINT "FK_9aefe091450823da119950f3290"`);
        await queryRunner.query(`DROP TABLE "subscription_event"`);
    }

}
