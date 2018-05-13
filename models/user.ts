"use strict";

import {
  Entity, BaseEntity, Index,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  OneToMany,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { password_hash_rounds } from "../lib/config";
import * as uuid from "uuid/v4";
import Session from "./session";
import Message from "./message";
import Subscription from "./subscription";
import { Permission } from "../lib/permission";

import { Interceptor, NestInterceptor, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";

@Entity()
@Index("email_unique_with_deletion", ["email", "deleteToken"], { unique: true })
@Index("email_unique_without_deletion", ["email"], { unique: true, where: "delete_token IS NULL" })
export default class User extends BaseEntity {
  constructor(email: string) {
    super();
    this.email = email;
  }
  @PrimaryGeneratedColumn("uuid")
  public id!: string;
  @Column({ type: "varchar", length: 50, nullable: false })
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
  public permission: Permission = new Permission();
  @OneToMany(() => Session, (session) => session.user)
  public sessions!: Promise<Session[]>;
  @OneToMany(() => Message, (message) => message.owner)
  public messages!: Promise<Message[]>;
  @OneToMany(() => Subscription, (subscription) => subscription.owner)
  public subscriptions!: Promise<Subscription[]>;
  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt!: Date;
  @Column({ name: "delete_token", type: "uuid", nullable: true })
  public deleteToken?: string;

  public markDeleted = () => this.deleteToken = uuid();
  public toView = () => (
    {
      id: this.id,
      email: this.email,
      permissions: this.permission.roles,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    }
  )
}

// tslint:disable-next-line:max-classes-per-file
@Interceptor()
export class UserInterceptor implements NestInterceptor {
  public intercept(_: any, __: ExecutionContext, stream$: Observable<any>): Observable<any> {
    return stream$.map((value) => {
      if (value instanceof User) {
        return value.toView();
      } else if (Array.isArray(value)) {
        return value.map((user) => user instanceof User ? user.toView() : user);
      } else {
        return value;
      }
    });
  }
}
