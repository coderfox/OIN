"use strict";

import {
  Entity, BaseEntity,
  Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn,
} from "typeorm";
import { confirmation_expires } from "../lib/config";
import * as uuid from "uuid/v4";
import ms = require("ms");

type op = { operation: Operations.Register, data: IRegisterData } |
  { operation: Operations.UpdateEmail, data: IUpdateEmailData } |
  { operation: Operations.PasswordRecovery, data: IPasswordRecoveryData };
export enum Operations {
  Register,
  UpdateEmail,
  PasswordRecovery,
}
export interface IRegisterData {
  email: string;
  hashedPassword: string;
}
export interface IUpdateEmailData {
  uid: string; // uuid
  newEmail: string;
}
export interface IPasswordRecoveryData {
  uid: string; // uuid
  newPassword: string;
}
@Entity()
export default class Cofirmation extends BaseEntity {
  constructor(opData: op) {
    super();
    if (opData) {
      this.id = uuid();
      this.operation = opData.operation;
      this.data = opData.data;
    }
  }
  private getNewExpirationDate = () =>
    new Date(Date.now() + ms(confirmation_expires))

  @PrimaryColumn({ type: "uuid" })
  public id!: string;
  @Column({ type: "int", nullable: false })
  public operation!: number;
  @Column({ type: "json", nullable: false })
  public data!: IRegisterData | IUpdateEmailData | IPasswordRecoveryData;
  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt!: Date;
  @Column({ name: "expires_at" })
  public expiresAt: Date = this.getNewExpirationDate();
  public get expired() {
    return this.expiresAt <= new Date();
  }
}
