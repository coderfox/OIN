"use strict";

import ms = require("ms");
import {
  BaseEntity, Column,
  CreateDateColumn, Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from "typeorm";
import { token_expires } from "../lib/config";
import IPermission from "./IPermission";
import User from "./user";

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
    cascadeUpdate: true,
  })
  @JoinColumn({ name: "user_id" })
  public user: User;
  @PrimaryGeneratedColumn("uuid")
  public token: string;
  @Column({ type: "jsonb" })
  public permissions: IPermission = { admin: false };
  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;
  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt: Date;
  @Column({ name: "expires_at" })
  public expiresAt: Date = this.getNewExpirationDate();
  public get expired() {
    return this.expiresAt <= new Date(Date.now()) || !!this.user.deleteToken;
  }

  public renew = () => {
    this.expiresAt = this.getNewExpirationDate();
  }

  public toView = async (ignoreExpiration = false) => {
    if (!ignoreExpiration && this.expired) {
      throw new Errors.TokenExpiredError(this.expiresAt);
    }
    return {
      token: this.token,
      user: this.user.toView(),
      permissions: this.permissions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: this.expiresAt,
    };
  }
}
