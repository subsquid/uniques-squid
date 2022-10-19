import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Status} from "./_status"
import {UniqueInstance} from "./uniqueInstance.model"
import {UniqueEvent} from "./uniqueEvent.model"
import {Attribute} from "./_attribute"

@Entity_()
export class UniqueClass {
  constructor(props?: Partial<UniqueClass>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @Column_("text", {nullable: true})
  owner!: string | undefined | null

  @Column_("text", {nullable: true})
  admin!: string | undefined | null

  @Column_("text", {nullable: true})
  issuer!: string | undefined | null

  @Column_("text", {nullable: true})
  creator!: string | undefined | null

  @Column_("text", {nullable: true})
  freezer!: string | undefined | null

  @Index_()
  @Column_("varchar", {length: 9, nullable: false})
  status!: Status

  @OneToMany_(() => UniqueInstance, e => e.uniqueClass)
  instances!: UniqueInstance[]

  @OneToMany_(() => UniqueEvent, e => e.uniqueClass)
  events!: UniqueEvent[]

  @Column_("text", {nullable: true})
  metadata!: string | undefined | null

  @Column_("jsonb", {transformer: {to: obj => obj.map((val: any) => val.toJSON()), from: obj => marshal.fromList(obj, val => new Attribute(undefined, marshal.nonNull(val)))}, nullable: false})
  attributes!: (Attribute)[]

  @Column_("int4", {nullable: true})
  maxSupply!: number | undefined | null

  @Index_()
  @Column_("timestamp with time zone", {nullable: false})
  createdAt!: Date
}
