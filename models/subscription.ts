import {
  Entity, BaseEntity,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import User from "./user";
import { Interceptor, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs/Observable";
import Service from "./service";

@Entity()
export default class Subscription extends BaseEntity {
  constructor(
    owner: User,
    service: Service,
    config = "",
  ) {
    super();
    this.owner = owner;
    this.service = service;
    this.config = config;
  }
  @PrimaryGeneratedColumn("uuid")
  public id!: string;
  @ManyToOne(() => User, (user) => user.subscriptions, {
    eager: true,
  })
  @JoinColumn({ name: "owner_id" })
  public owner: User;
  @ManyToOne(() => Service, (service) => service.subscriptions, {
    eager: true,
  })
  @JoinColumn({ name: "service_id" })
  public service: Service;
  @Column({ type: "text" })
  public config: string;
  @Column()
  public deleted: boolean = false;
  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt!: Date;

  public toView = () => ({
    id: this.id,
    owner: this.owner.id,
    service: this.service.id,
    config: this.config,
    deleted: this.deleted,
    created_at: this.createdAt,
    updated_at: this.updatedAt,
  })
}

// tslint:disable-next-line:max-classes-per-file
@Interceptor()
export class SubscriptionInterceptor implements NestInterceptor {
  public intercept(_: any, __: ExecutionContext, stream$: Observable<any>): Observable<any> {
    return stream$.map((value) => {
      if (value instanceof Subscription) {
        return value.toView();
      } else if (Array.isArray(value)) {
        return value.map((subscription) =>
          subscription instanceof Subscription ? subscription.toView() : subscription);
      } else {
        return value;
      }
    });
  }
}
