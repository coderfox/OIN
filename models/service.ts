"use strict";

import {
  Entity, BaseEntity,
  Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn,
  Generated,
  OneToMany,
} from "typeorm";
import Subscription from "./subscription";
import { Interceptor, NestInterceptor, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

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

  @OneToMany(() => Subscription, (subscription) => subscription.service)
  public subscriptions!: Promise<Subscription[]>;

  public toView = () => ({
    id: this.id,
    title: this.name,
    description: this.description || "",
  })
}

// tslint:disable-next-line:max-classes-per-file
@Interceptor()
export class ServiceInterceptor implements NestInterceptor {
  public intercept(_: ExecutionContext, call$: Observable<any>): Observable<any> {
    return call$.pipe(map(value => {
      if (value instanceof Service) {
        return value.toView();
      } else if (Array.isArray(value)) {
        return value.map((service) => service instanceof Service ? service.toView() : service);
      } else {
        return value;
      }
    }));
  }
}
