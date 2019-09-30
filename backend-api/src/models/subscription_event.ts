import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import Subscription from "./subscription";
import { Exclude, Expose, Transform } from "class-transformer";

@Entity({ name: "subscription_event" })
@Exclude()
export default class SubscriptionEvent extends BaseEntity {
  constructor(
    subscription: Subscription,
    status = true,
    message = "succeeded",
  ) {
    super();
    this.subscription = subscription;
    this.status = status;
    this.message = message;
  }

  @PrimaryGeneratedColumn("uuid")
  @Expose()
  public id!: string;

  @ManyToOne(() => Subscription, subscription => subscription.events, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: "subscription_id" })
  @Expose()
  @Transform((value: Subscription) => value.id)
  public subscription: Subscription;

  @Column()
  @Expose()
  public status: boolean;

  @Column("varchar")
  @Expose()
  public message: string;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  @Expose()
  public time!: Date;
}
