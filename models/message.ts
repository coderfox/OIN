"use strict";

import {
  Entity, BaseEntity,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import User from "./user";
import { Injectable, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import Subscription from "./subscription";

@Entity()
export default class Message extends BaseEntity {
  constructor(
    owner: User,
    subscription: Subscription,
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
  @ManyToOne(() => Subscription, (subscription) => subscription.messages, {
    eager: true,
  })
  @JoinColumn({ name: "subscription_id" })
  public subscription: Subscription;
  @Column("text")
  public title: string;
  @Column("text")
  public summary: string;
  @Column("text")
  public content: string;
  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt!: Date;

  public toViewSimplified = () => ({
    id: this.id,
    readed: this.readed,
    owner: this.owner.id,
    subscription: this.subscription.id,
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
@Injectable()
export class MessageInterceptor implements NestInterceptor {
  public intercept(_: ExecutionContext, call$: Observable<any>): Observable<any> {
    return call$.pipe(map(value => {
      if (value instanceof Message) {
        return value.toView();
      } else if (Array.isArray(value)) {
        return value.map((message) => message instanceof Message ? message.toViewSimplified() : message);
      } else {
        return value;
      }
    }));
  }
}
