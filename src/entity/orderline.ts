
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm";
import { Order } from "./order"

@Entity("Orderline")
export class Orderline extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    ExternalId!: string

    @Column()
    No!: string

    @Column()
    Name!: string

    @Column({ type: "timestamp", default: new Date() })
    created!: Date

    @Column({ type: "timestamp", default: new Date() })
    updated!: Date

    @Column()
    count!: number

    @Column({ type: "decimal", nullable: true })
    quantity!: number

    @Column()
    set!: number

    @Column({ type: "decimal" })
    price!: number

    @Column({ type: "decimal" })
    discount!: number

    @Column()
    items!: number

    @Column({ type: "decimal" })
    sum!: number

    @ManyToOne(type => Order, order => order.orderlines)
    order!: Order
}
