"use strict";

import {
  Entity, BaseEntity,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { serialize, Serialize } from "cerialize";
import User from "./user";

@Entity()
export default class Message extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @serialize
  public id: string;
  @Column()
  @serialize
  public readed: boolean;
  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: "owner_id" })
  public owner: User;
  @Column({ type: "uuid" })
  public subscription: string;
  @Column({ length: 150 })
  public title: string;
  @Column({ type: "text" })
  public abstract: string;
  @Column({ name: "content_type" })
  public contentType: string;
  @Column({ type: "text" })
  public content: string;
  @CreateDateColumn({ name: "created_at" })
  @serialize
  public createdAt: Date;
  @UpdateDateColumn({ name: "updated_at" })
  @serialize
  public updatedAt: Date;

  public toView = () => Serialize(this);
}
