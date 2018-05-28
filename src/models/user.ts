import {
  Entity, BaseEntity, Index,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  OneToMany,
} from "typeorm";
import bcrypt from "bcrypt";
import { PASSWORD_HASH_ROUNDS } from "../lib/config";
import uuid from "uuid/v4";
import Session from "./session";
import Message from "./message";
import Subscription from "./subscription";
import { Permission } from "../lib/permission";
import { Exclude, Expose, Transform } from "class-transformer";

@Entity()
@Index("email_unique_with_deletion", ["email", "delete_token"], { unique: true })
@Index("email_unique_without_deletion", ["email"], { unique: true, where: "delete_token IS NULL" })
@Exclude()
export default class User extends BaseEntity {
  constructor(email: string, nickname?: string) {
    super();
    this.email = email;
    this.nickname = nickname || email;
  }

  @PrimaryGeneratedColumn("uuid")
  @Expose()
  public id!: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  @Expose()
  public email: string;

  @Column({ name: "password", type: "varchar" })
  public password_hashed?: string;

  public static hash_password = (password: string) =>
    bcrypt.hash(password, PASSWORD_HASH_ROUNDS)
  public set_password = async (password: string) => {
    this.password_hashed = await User.hash_password(password);
  }
  public check_password = async (password: string) =>
    this.password_hashed ? bcrypt.compare(password, this.password_hashed) : false

  @Column("varchar", {
    array: true, transformer: {
      to: (roles: Permission) => roles.roles,
      from: (value) => new Permission(value),
    },
  })
  @Expose({ name: "permissions" })
  @Transform((value: Permission) => value.roles)
  public permission: Permission = new Permission();

  @OneToMany(() => Session, (session) => session.user)
  public sessions!: Promise<Session[]>;

  @OneToMany(() => Message, (message) => message.owner)
  public messages!: Promise<Message[]>;

  @OneToMany(() => Subscription, (subscription) => subscription.owner)
  public subscriptions!: Promise<Subscription[]>;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  @Expose({ name: "created_at" })
  public created_at!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  @Expose({ name: "updated_at" })
  public updated_at!: Date;

  @Column({ name: "delete_token", type: "uuid", nullable: true })
  public delete_token?: string;

  public mark_deleted = () => this.delete_token = uuid();

  @Expose()
  @Column("varchar")
  public nickname: string;
}
