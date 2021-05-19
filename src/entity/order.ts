import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm"
import { Orderline } from "./orderline"

@Entity("Order")
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ unique: true, nullable: true })
    ExternalId!: string

    @Column({ nullable: true })
    OrderNumber!: number

    @Column()
    Name!: string

    @Column()
    CustomerId!: string

    @Column({ nullable: true })
    CustomerNumber!: string

    @Column({ type: "timestamp", default: new Date() })
    created!: Date

    @Column({ type: "timestamp", default: new Date() })
    updated!: Date

    @Column({ nullable: true })
    OurReference!: string

    @OneToMany(type => Orderline, orderline => orderline.order)
    orderlines!: Orderline[]
}
