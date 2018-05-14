import {
  Entity, BaseEntity,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from "typeorm";
import { token_expires } from "../lib/config";
import User from "./user";
import ms from "ms";
import { Permission } from "../lib/permission";
import { Exclude, Expose, Transform } from "class-transformer";

// tslint:disable:max-classes-per-file
// tslint:disable-next-line:no-namespace
export namespace Errors {
  export class UserNotFoundError extends Error {
    public token: string;
    public uid: number;
    constructor(sid: string, uid: number) {
      super(`invalid entry uid=${uid} for session ${sid}`);
      this.name = "UserNotFoundForSessionError";
      this.token = sid;
      this.uid = uid;
    }
  }
  export class TokenExpiredError extends Error {
    public expiredAt: Date;
    public currentTime: Date;
    constructor(expiresAt: Date) {
      super(`token expired at ${expiresAt.toJSON}`);
      this.name = "TokenExpiredError";
      this.expiredAt = expiresAt;
      this.currentTime = new Date(Date.now());
    }
  }
}

@Exclude()
@Entity()
export default class Session extends BaseEntity {
  constructor(user: User) {
    super();
    if (user) {
      this.user = user;
    }
  }
  private getNewExpirationDate = () =>
    new Date(Date.now() + ms(token_expires))

  @ManyToOne(() => User, (user) => user.sessions, {
    eager: true,
  })
  @JoinColumn({ name: "user_id" })
  @Expose()
  public user!: User;

  @PrimaryGeneratedColumn("uuid")
  @Expose()
  public token!: string;

  @Column("varchar", {
    length: 10,
    array: true, transformer: {
      to: (roles: Permission) => roles.roles,
      from: (value) => new Permission(value),
    },
  })
  @Expose({ name: "permissions" })
  @Transform((value: Permission) => value.roles)
  public permission: Permission = new Permission();

  @CreateDateColumn({ name: "created_at" })
  @Expose({ name: "created_at" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  @Expose({ name: "updated_at" })
  public updatedAt!: Date;

  @Column({ name: "expires_at" })
  @Expose({ name: "expires_at" })
  public expiresAt: Date = this.getNewExpirationDate();

  public get expired() {
    return (this.expiresAt <= new Date()) || !!this.user.deleteToken;
  }

  public renew = () => {
    this.expiresAt = this.getNewExpirationDate();
  }
}
