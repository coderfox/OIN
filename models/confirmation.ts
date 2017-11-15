"use strict";

import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import config from "../lib/config";
import * as uuid from "uuid/v4";
import ms = require("ms");

export enum Operations {
  Register,
}
export interface IRegisterData {
  email: string;
  hashedPassword: string;
}
@Entity()
export default class Cofirmation {
  constructor(operation: Operations, data: IRegisterData) {
    this.id = uuid();
    this.operation = operation;
    this.data = data;
  }
  private getNewExpirationDate = () =>
    new Date(Date.now() + ms(config.get("confirmation_expires") as string))

  @PrimaryColumn({ type: "uuid" })
  public id: string;
  @Column({ type: "int", nullable: false })
  public operation: number;
  @Column({ type: "json", nullable: false })
  public data: IRegisterData;
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
