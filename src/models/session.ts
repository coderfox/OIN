import {
  Entity, BaseEntity,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from "typeorm";
import { TOKEN_EXPIRES } from "../lib/config";
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
    public expired_at: Date;
    public current_time: Date;
    constructor(expires_at: Date) {
      super(`token expired at ${expires_at.toJSON}`);
      this.name = "TokenExpiredError";
      this.expired_at = expires_at;
      this.current_time = new Date(Date.now());
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
  private _get_new_expires_at = () =>
    new Date(Date.now() + ms(TOKEN_EXPIRES))

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
    array: true, transformer: {
      to: (roles: Permission) => roles.roles,
      from: (value) => new Permission(value),
    },
  })
  @Expose({ name: "permissions" })
  @Transform((value: Permission) => value.roles)
  public permission: Permission = new Permission();

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  @Expose({ name: "created_at" })
  public created_at!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  @Expose({ name: "updated_at" })
  public updated_at!: Date;

  @Column({ name: "expires_at", type: "timestamptz" })
  @Expose({ name: "expires_at" })
  public expires_at: Date = this._get_new_expires_at();

  public get expired() {
    return (this.expires_at <= new Date()) || !!this.user.delete_token;
  }

  public renew = () => {
    this.expires_at = this._get_new_expires_at();
  }
}
