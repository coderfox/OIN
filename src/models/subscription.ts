import {
  Entity, BaseEntity,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany,
  JoinColumn,
} from "typeorm";
import User from "./user";
import Service from "./service";
import Message from "./message";
import SubscriptionEvent from "./subscription_event";
import { Exclude, Expose, Transform } from "class-transformer";

@Entity()
@Exclude()
export default class Subscription extends BaseEntity {
  constructor(
    owner: User,
    service: Service,
    config = "",
    name?: string,
  ) {
    super();
    this.owner = owner;
    this.service = service;
    this.config = config;
    this.name = name || "新订阅";
  }

  @PrimaryGeneratedColumn("uuid")
  @Expose()
  public id!: string;

  @ManyToOne(() => User, (user) => user.subscriptions, {
    eager: true, nullable: false,
  })
  @JoinColumn({ name: "owner_id" })
  @Expose()
  @Transform((value: User) => value.id)
  public owner: User;

  @ManyToOne(() => Service, (service) => service.subscriptions, {
    eager: true, nullable: false,
  })
  @JoinColumn({ name: "service_id" })
  @Expose()
  @Transform((value: Service) => value.id)
  public service: Service;

  @Column({ type: "text" })
  @Expose()
  public config: string;

  @Column()
  @Expose()
  public deleted: boolean = false;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  @Expose({ name: "created_at" })
  public created_at!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  @Expose({ name: "updated_at" })
  public updated_at!: Date;

  @OneToMany(() => Message, (message) => message.subscription)
  public messages!: Promise<Message[]>;

  @Expose()
  @Column("varchar")
  public name: string;

  @OneToMany(() => SubscriptionEvent, (event) => event.subscription)
  public events!: Promise<SubscriptionEvent[]>;

  @Expose()
  public last_event?: SubscriptionEvent | null;

  public fetch_last_event = async () => {
    this.last_event = await SubscriptionEvent.findOne({
      where: { subscription: this },
      order: { time: "DESC" },
    }) || null;
  }
}
