"use strict";

import {
  Entity, BaseEntity,
  Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn,
  Generated,
} from "typeorm";

@Entity()
export default class Service extends BaseEntity {
  constructor(id: string, name: string, description?: string) {
    super();
    this.id = id;
    this.name = name;
    this.description = description;
  }
  @PrimaryColumn("uuid")
  public id: string;
  @Column({ type: "varchar", length: 50, nullable: false })
  public name: string;
  @Column({ unique: true })
  @Generated("uuid")
  public token!: string;
  @Column({ nullable: true })
  public description?: string;
  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt!: Date;
}
