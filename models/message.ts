"use strict";

import {
  Entity, BaseEntity,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import User from "./user";

@Entity()
export default class Message extends BaseEntity {
  constructor(
    owner: User,
    subscription: string,
    title: string,
    abstract: string,
    contentType: string,
    content: string,
  ) {
    super();
    this.owner = owner;
    this.subscription = subscription;
    this.title = title;
    this.abstract = abstract;
    this.contentType = contentType;
    this.content = content;
  }
  @PrimaryGeneratedColumn("uuid")
  public id!: string;
  @Column()
  public readed: boolean = false;
  @ManyToOne(() => User, (user) => user.messages, {
    eager: true,
  })
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
  public createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt!: Date;

  public toViewSimplified = () => ({
    id: this.id,
    readed: this.readed,
    owner: this.owner.id,
    subscription: this.subscription,
    title: this.title,
    abstract: this.abstract,
    createdAt: this.createdAt.toJSON(),
    updatedAt: this.updatedAt.toJSON(),
  })
  public toView = () => ({
    ...this.toViewSimplified(),
    content: {
      type: this.contentType,
      data: this.content,
    },
  })
}
