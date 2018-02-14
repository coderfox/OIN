"use strict";

import {
  Entity, BaseEntity,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  Generated
} from "typeorm";
import { serialize as Serialize, Serialize as serialize } from "cerialize";

@Entity()
export default class Service extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Serialize
  public id: string;
  @Column({ type: "varchar", length: 50, nullable: false })
  @Serialize
  public name: string;
  @Column({ unique: true })
  @Generated("uuid")
  public token: string;
  @Column({ nullable: true })
  @Serialize
  public description?: string;
  @CreateDateColumn({ name: "created_at" })
  @Serialize
  public createdAt: Date;
  @UpdateDateColumn({ name: "updated_at" })
  @Serialize
  public updatedAt: Date;

  public toView = () => serialize(this);
}
