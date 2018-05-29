import {MigrationInterface, QueryRunner} from "typeorm";

export class ForeignKeysNotNull1527589194465 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_30e98e8746699fb9af235410aff"`);
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscription_event" DROP CONSTRAINT "FK_9aefe091450823da119950f3290"`);
        await queryRunner.query(`ALTER TABLE "subscription_event" ALTER COLUMN "subscription_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscription" DROP CONSTRAINT "FK_6fc397c4a3db7320076e7aa1605"`);
        await queryRunner.query(`ALTER TABLE "subscription" DROP CONSTRAINT "FK_79f599f6ffb8c8e77c031fb2ed4"`);
        await queryRunner.query(`ALTER TABLE "subscription" ALTER COLUMN "owner_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscription" ALTER COLUMN "service_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_f9d46fa3f655b6cd6a2a4925663"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_42d48114cb1d2ec951958614cf4"`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "owner_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "subscription_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_30e98e8746699fb9af235410aff" FOREIGN KEY ("user_id") REFERENCES "user"("id")`);
        await queryRunner.query(`ALTER TABLE "subscription_event" ADD CONSTRAINT "FK_9aefe091450823da119950f3290" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id")`);
        await queryRunner.query(`ALTER TABLE "subscription" ADD CONSTRAINT "FK_6fc397c4a3db7320076e7aa1605" FOREIGN KEY ("owner_id") REFERENCES "user"("id")`);
        await queryRunner.query(`ALTER TABLE "subscription" ADD CONSTRAINT "FK_79f599f6ffb8c8e77c031fb2ed4" FOREIGN KEY ("service_id") REFERENCES "service"("id")`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_f9d46fa3f655b6cd6a2a4925663" FOREIGN KEY ("owner_id") REFERENCES "user"("id")`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_42d48114cb1d2ec951958614cf4" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_42d48114cb1d2ec951958614cf4"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_f9d46fa3f655b6cd6a2a4925663"`);
        await queryRunner.query(`ALTER TABLE "subscription" DROP CONSTRAINT "FK_79f599f6ffb8c8e77c031fb2ed4"`);
        await queryRunner.query(`ALTER TABLE "subscription" DROP CONSTRAINT "FK_6fc397c4a3db7320076e7aa1605"`);
        await queryRunner.query(`ALTER TABLE "subscription_event" DROP CONSTRAINT "FK_9aefe091450823da119950f3290"`);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_30e98e8746699fb9af235410aff"`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "subscription_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "owner_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_42d48114cb1d2ec951958614cf4" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_f9d46fa3f655b6cd6a2a4925663" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscription" ALTER COLUMN "service_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscription" ALTER COLUMN "owner_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscription" ADD CONSTRAINT "FK_79f599f6ffb8c8e77c031fb2ed4" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscription" ADD CONSTRAINT "FK_6fc397c4a3db7320076e7aa1605" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscription_event" ALTER COLUMN "subscription_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscription_event" ADD CONSTRAINT "FK_9aefe091450823da119950f3290" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_30e98e8746699fb9af235410aff" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
