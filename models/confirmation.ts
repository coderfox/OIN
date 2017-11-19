"use strict";

import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import config from "../lib/config";
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
export default class Cofirmation {
  constructor(opData: op) {
    this.id = uuid();
    this.operation = opData.operation;
    this.data = opData.data;
  }
  private getNewExpirationDate = () =>
    new Date(Date.now() + ms(config.get("confirmation_expires") as string))

  @PrimaryColumn({ type: "uuid" })
  public id: string;
  @Column({ type: "int", nullable: false })
  public operation: number;
  @Column({ type: "json", nullable: false })
  public data: IRegisterData | IUpdateEmailData | IPasswordRecoveryData;
  @CreateDateColumn()
  public createdAt: Date;
  @UpdateDateColumn()
  public updatedAt: Date;
  @Column({ type: "timestamp without time zone" })
  public expiresAt: Date = this.getNewExpirationDate();
  public get expired() {
    return this.expiresAt <= new Date();
  }
}
