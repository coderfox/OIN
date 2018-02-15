"use strict";

import {
  Entity, BaseEntity,
  Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn,
  Generated
} from "typeorm";
import {
  serialize as Serialize,
  serializeAs as SerializeAs,
  Serialize as serialize
} from "cerialize";

@Entity()
export default class Service extends BaseEntity {
  constructor(id: string, name: string, description?: string) {
    super();
    this.id = id;
    this.name = name;
    this.description = description;
  }
  @PrimaryColumn("uuid")
  @Serialize
  public id: string;
  @Column({ type: "varchar", length: 50, nullable: false })
  @SerializeAs("title")
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
