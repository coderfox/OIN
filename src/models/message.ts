import {
  Entity, BaseEntity,
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import User from "./user";
import Subscription from "./subscription";
import { Exclude, Expose, Transform } from "class-transformer";

@Entity()
@Exclude()
export default class Message extends BaseEntity {
  constructor(
    owner: User,
    subscription: Subscription,
    title: string,
    abstract: string,
    content: string,
    href?: string | null,
  ) {
    super();
    this.owner = owner;
    this.subscription = subscription;
    this.title = title;
    this.summary = abstract;
    this.content = content;
    this.href = href;
  }

  @PrimaryGeneratedColumn("uuid")
  @Expose()
  public id!: string;

  @Column()
  @Expose()
  public readed: boolean = false;

  @ManyToOne(() => User, (user) => user.messages, {
    eager: true,
  })
  @JoinColumn({ name: "owner_id" })
  @Expose()
  @Transform((value: User) => value.id)
  public owner: User;

  @ManyToOne(() => Subscription, (subscription) => subscription.messages, {
    eager: true,
  })
  @JoinColumn({ name: "subscription_id" })
  @Expose()
  @Transform((value: Subscription) => value.id)
  public subscription: Subscription;

  @Column("text")
  @Expose()
  public title: string;

  @Column("text")
  @Expose()
  public summary: string;

  @Column("text")
  @Expose({ since: 1.1 })
  public content: string;

  @CreateDateColumn({ name: "created_at" })
  @Expose({ name: "created_at" })
  public created_at!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  @Expose({ name: "updated_at" })
  public updated_at!: Date;

  @Expose()
  @Column("varchar", { nullable: true })
  public href?: string | null;
}
