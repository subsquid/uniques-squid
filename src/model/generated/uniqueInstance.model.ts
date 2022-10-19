import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {UniqueClass} from "./uniqueClass.model"
import {Account} from "./account.model"
import {Status} from "./_status"
import {UniqueEvent} from "./uniqueEvent.model"
import {Attribute} from "./_attribute"

@Entity_()
export class UniqueInstance {
  constructor(props?: Partial<UniqueInstance>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @Column_("int4", {nullable: false})
  innerID!: number

  @Index_()
  @ManyToOne_(() => UniqueClass, {nullable: true})
  uniqueClass!: UniqueClass

  @Index_()
  @ManyToOne_(() => Account, {nullable: true})
  owner!: Account

  @Index_()
  @Column_("varchar", {length: 9, nullable: false})
  status!: Status

  @OneToMany_(() => UniqueEvent, e => e.uniqueInstance)
  events!: UniqueEvent[]

  @Column_("text", {nullable: true})
  metadata!: string | undefined | null

  @Column_("jsonb", {transformer: {to: obj => obj.map((val: any) => val.toJSON()), from: obj => marshal.fromList(obj, val => new Attribute(undefined, marshal.nonNull(val)))}, nullable: false})
  attributes!: (Attribute)[]

  @Index_()
  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  price!: bigint

  @Index_()
  @Column_("timestamp with time zone", {nullable: false})
  mintedAt!: Date
}
