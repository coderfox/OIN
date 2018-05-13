"use strict";

import {
  Entity, BaseEntity,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import User from "./user";
import { Interceptor, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs/Observable";

@Entity()
export default class Message extends BaseEntity {
  constructor(
    owner: User,
    subscription: string,
    title: string,
    abstract: string,
    content: string,
  ) {
    super();
    this.owner = owner;
    this.subscription = subscription;
    this.title = title;
    this.summary = abstract;
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
  public summary: string;
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
    summary: this.summary,
    created_at: this.createdAt.toJSON(),
    updated_at: this.updatedAt.toJSON(),
  })
  public toView = () => ({
    ...this.toViewSimplified(),
    content: this.content,
  })
}

// tslint:disable-next-line:max-classes-per-file
@Interceptor()
export class MessageInterceptor implements NestInterceptor {
  public intercept(_: any, __: ExecutionContext, stream$: Observable<any>): Observable<any> {
    return stream$.map((value) => {
      if (value instanceof Message) {
        return value.toView();
      } else if (Array.isArray(value)) {
        return value.map((message) => message instanceof Message ? message.toViewSimplified() : message);
      } else {
        return value;
      }
    });
  }
}
