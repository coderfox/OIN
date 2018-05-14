import {
  Entity, BaseEntity,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from "typeorm";
import { token_expires } from "../lib/config";
import User from "./user";
import ms from "ms";
import { Permission } from "../lib/permission";

import { Injectable, NestInterceptor, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import "rxjs/add/operator/map";

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
  public user!: User;
  @PrimaryGeneratedColumn("uuid")
  public token!: string;
  @Column("varchar", {
    length: 10,
    array: true, transformer: {
      to: (roles: Permission) => roles.roles,
      from: (value) => new Permission(value),
    },
  })
  public permission: Permission = new Permission();
  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt!: Date;
  @Column({ name: "expires_at" })
  public expiresAt: Date = this.getNewExpirationDate();
  public get expired() {
    return (this.expiresAt <= new Date()) || !!this.user.deleteToken;
  }

  public renew = () => {
    this.expiresAt = this.getNewExpirationDate();
  }
  public toView = () => {
    return {
      token: this.token,
      user: this.user.toView(),
      permissions: this.permission.roles,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      expires_at: this.expiresAt,
    };
  }
}

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  public intercept(_: ExecutionContext, call$: Observable<any>): Observable<any> {
    return call$.pipe(map(value => {
      if (value instanceof Session) {
        return value.toView();
      } else if (Array.isArray(value)) {
        return value.map((session) => session instanceof Session ? session.toView() : session);
      } else {
        return value;
      }
    }));
  }
}
