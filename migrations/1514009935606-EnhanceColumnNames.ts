import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhanceColumnNames1514009935606 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."session" DROP CONSTRAINT "fk_befa332be8da6956e9e44a3e39a"`);
        await queryRunner.query(`ALTER TABLE "public"."message" DROP CONSTRAINT "fk_c39f3f3b187c194fe5a05161da2"`);
        await queryRunner.query(`ALTER TABLE "public"."session" DROP "createdAt"`);
        await queryRunner.query(`ALTER TABLE "public"."session" DROP "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "public"."session" DROP "userId"`);
        await queryRunner.query(`ALTER TABLE "public"."message" DROP "createdAt"`);
        await queryRunner.query(`ALTER TABLE "public"."message" DROP "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "public"."message" DROP "ownerId"`);
        await queryRunner.query(`ALTER TABLE "public"."user" DROP "createdAt"`);
        await queryRunner.query(`ALTER TABLE "public"."user" DROP "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "public"."session" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."session" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."session" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "public"."message" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."message" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."message" ADD "owner_id" uuid`);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."session"
            ADD CONSTRAINT "fk_978571afb24326c18bd04262803"
            FOREIGN KEY ("user_id") REFERENCES "user"("id")`);
        await queryRunner.query(`ALTER TABLE "public"."message"
            ADD CONSTRAINT "fk_684f06a81d3f144920b6790c521"
            FOREIGN KEY ("owner_id") REFERENCES "user"("id")`);
        await queryRunner.query(`ALTER TABLE "public"."session" DROP "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "public"."session" ADD "expires_at" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."cofirmation" DROP "createdAt"`);
        await queryRunner.query(`ALTER TABLE "public"."cofirmation" DROP "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "public"."cofirmation" DROP "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "public"."cofirmation" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."cofirmation" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."cofirmation" ADD "expires_at" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "public"."message" DROP CONSTRAINT "fk_684f06a81d3f144920b6790c521"`);
        await queryRunner.query(`ALTER TABLE "public"."session" DROP CONSTRAINT "fk_978571afb24326c18bd04262803"`);
        await queryRunner.query(`ALTER TABLE "public"."user" DROP "updated_at"`);
        await queryRunner.query(`ALTER TABLE "public"."user" DROP "created_at"`);
        await queryRunner.query(`ALTER TABLE "public"."message" DROP "owner_id"`);
        await queryRunner.query(`ALTER TABLE "public"."message" DROP "updated_at"`);
        await queryRunner.query(`ALTER TABLE "public"."message" DROP "created_at"`);
        await queryRunner.query(`ALTER TABLE "public"."session" DROP "user_id"`);
        await queryRunner.query(`ALTER TABLE "public"."session" DROP "updated_at"`);
        await queryRunner.query(`ALTER TABLE "public"."session" DROP "created_at"`);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "createdAt" TIMESTAMP(6) NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."message" ADD "ownerId" uuid`);
        await queryRunner.query(`ALTER TABLE "public"."message" ADD "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."message" ADD "createdAt" TIMESTAMP(6) NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."session" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "public"."session" ADD "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."session" ADD "createdAt" TIMESTAMP(6) NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."message"
            ADD CONSTRAINT "fk_c39f3f3b187c194fe5a05161da2"
            FOREIGN KEY ("") REFERENCES ""("")`);
        await queryRunner.query(`ALTER TABLE "public"."session"
            ADD CONSTRAINT "fk_befa332be8da6956e9e44a3e39a"
            FOREIGN KEY ("") REFERENCES ""("")`);
        await queryRunner.query(`ALTER TABLE "public"."session" DROP "expires_at"`);
        await queryRunner.query(`ALTER TABLE "public"."session" ADD "expiresAt" TIMESTAMP(6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."cofirmation" DROP "expires_at"`);
        await queryRunner.query(`ALTER TABLE "public"."cofirmation" DROP "updated_at"`);
        await queryRunner.query(`ALTER TABLE "public"."cofirmation" DROP "created_at"`);
        await queryRunner.query(`ALTER TABLE "public"."cofirmation" ADD "expiresAt" TIMESTAMP(6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."cofirmation"
            ADD "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "public"."cofirmation"
            ADD "createdAt" TIMESTAMP(6) NOT NULL DEFAULT now()`);
    }

}
