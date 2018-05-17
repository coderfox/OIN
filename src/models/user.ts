import {
  Entity, BaseEntity, Index,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  OneToMany,
} from "typeorm";
import bcrypt from "bcrypt";
import { password_hash_rounds } from "../lib/config";
import uuid from "uuid/v4";
import Session from "./session";
import Message from "./message";
import Subscription from "./subscription";
import { Permission } from "../lib/permission";
import { Exclude, Expose, Transform } from "class-transformer";

@Entity()
@Index("email_unique_with_deletion", ["email", "deleteToken"], { unique: true })
@Index("email_unique_without_deletion", ["email"], { unique: true, where: "delete_token IS NULL" })
@Exclude()
export default class User extends BaseEntity {
  constructor(email: string) {
    super();
    this.email = email;
  }

  @PrimaryGeneratedColumn("uuid")
  @Expose()
  public id!: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  @Expose()
  public email: string;

  @Column({ name: "password", type: "varchar" })
  public hashedPassword?: string;

  public static hashPassword = (password: string) =>
    bcrypt.hash(password, password_hash_rounds)
  public setPassword = async (password: string) => {
    this.hashedPassword = await User.hashPassword(password);
  }
  public checkPassword = async (password: string) =>
    this.hashedPassword ? bcrypt.compare(password, this.hashedPassword) : false

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

  @CreateDateColumn({ name: "created_at" })
  @Expose({ name: "created_at" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  @Expose({ name: "updated_at" })
  public updatedAt!: Date;

  @Column({ name: "delete_token", type: "uuid", nullable: true })
  public deleteToken?: string;

  public markDeleted = () => this.deleteToken = uuid();
}
