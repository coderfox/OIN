"use strict";

import { Entity, Index, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import * as bcrypt from "bcrypt";
import config from "../lib/config";
import IPermission from "./IPermission";
import * as uuid from "uuid/v4";

@Entity()
@Index("email_unique_with_deletion", ["email", "deleteToken"], { unique: true })
export default class User {
  constructor(email: string) {
    this.email = email;
  }
  @PrimaryGeneratedColumn()
  public id: number;
  @Column({ type: "varchar", length: 50, nullable: false })
  public email: string;
  @Column({ name: "password", type: "varchar" })
  public hashedPassword: string;
  public static hashPassword = (password: string) =>
    bcrypt.hash(password, config.get("password_hash_rounds"))
  public setPassword = async (password: string) => {
    this.hashedPassword = await User.hashPassword(password);
  }
  public checkPassword = async (password: string) =>
    bcrypt.compare(password, this.hashedPassword)
  @Column({ type: "jsonb" })
  public permissions: IPermission = { admin: false };
  @CreateDateColumn()
  public createdAt: Date;
  @UpdateDateColumn()
  public updatedAt: Date;
  @Column({ name: "delete_token", type: "uuid", nullable: true })
  public deleteToken?: string;

  public toView = () => {
    return {
      id: this.id,
      email: this.email,
      permissions: this.permissions,
      createdAt: this.createdAt.toJSON(),
      updatedAt: this.updatedAt.toJSON(),
    };
  }
  public markDeleted = () => {
    this.deleteToken = uuid();
  }
}
