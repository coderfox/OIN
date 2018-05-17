import {
  Entity, BaseEntity,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany,
  JoinColumn,
} from "typeorm";
import User from "./user";
import Service from "./service";
import Message from "./message";
import { Exclude, Expose, Transform } from "class-transformer";

@Entity()
@Exclude()
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
  @Expose()
  public id!: string;

  @ManyToOne(() => User, (user) => user.subscriptions, {
    eager: true,
  })
  @JoinColumn({ name: "owner_id" })
  @Expose()
  @Transform((value: User) => value.id)
  public owner: User;

  @ManyToOne(() => Service, (service) => service.subscriptions, {
    eager: true,
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

  @CreateDateColumn({ name: "created_at" })
  @Expose({ name: "created_at" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  @Expose({ name: "updated_at" })
  public updatedAt!: Date;

  @OneToMany(() => Message, (message) => message.subscription)
  public messages!: Promise<Message[]>;
}
