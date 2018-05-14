import {
  Entity, BaseEntity,
  Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn,
  Generated,
  OneToMany,
} from "typeorm";
import Subscription from "./subscription";
import { Exclude, Expose } from "class-transformer";

@Entity()
@Exclude()
export default class Service extends BaseEntity {
  constructor(id: string, name: string, description?: string) {
    super();
    this.id = id;
    this.name = name;
    this.description = description;
  }
  @PrimaryColumn("uuid")
  @Expose()
  public id: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  @Expose({ name: "title" })
  public name: string;

  @Column({ unique: true })
  @Generated("uuid")
  public token!: string;

  @Column({ nullable: true })
  @Expose({ name: "description" })
  public description?: string;

  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt!: Date;

  @OneToMany(() => Subscription, (subscription) => subscription.service)
  public subscriptions!: Promise<Subscription[]>;
}
