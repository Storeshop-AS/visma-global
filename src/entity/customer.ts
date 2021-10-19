import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"
  
@Entity('Customer')
export class Customer extends BaseEntity {
    @PrimaryGeneratedColumn()
    Id!: number

    @Column({unique: true, nullable: true})
    ExternalId!: string

    @Column({unique: false, nullable: true})
    CustomerNumber!: string

    @Column({unique: false, nullable: true})
    PriceClass!: string

    @Column({ nullable: true })
    Syncronized!: boolean

    @Column({type: 'boolean', nullable: true})
    IsActive!: boolean

    @Column({type: 'int', nullable: true})
    Retries!: number

    @Column()
    Name!: string

    @Column({nullable: true})
    EmailAddress!: string // Main email address (invoice email address)

    @Column({nullable: true})
    EmailAddresses!: string // JSON string with other email addresses (from array)

    @Column({nullable: true})
    ContactPersonEmail!: string

    @Column({nullable: true})
    ContactPersonPhone!: string

    @Column({nullable: true})
    ContactPersonMobile!: string

    @Column({nullable: true})
    ContactPersonName!: string

    // Invoice

    @Column({nullable: true})
    InvoiceAddress1!: string

    @Column({nullable: true})
    InvoiceAddress2!: string

    @Column({nullable: true})
    InvoiceCountryCode!: string

    @Column({nullable: true})
    InvoicePostalCode!: string

    @Column({nullable: true})
    InvoicePostalAddress!: string

    // Delivery

    @Column({nullable: true})
    DeliveryCustomerName!: string

    @Column({nullable: true})
    DeliveryAddress1!: string

    @Column({nullable: true})
    DeliveryAddress2!: string

    @Column({nullable: true})
    DeliveryCountryCode!: string

    @Column({nullable: true})
    DeliveryPostalCode!: string

    @Column({nullable: true})
    DeliveryPostalAddress!: string

    @Column({type: 'timestamp', nullable: true})
    Updated!: Date;
}
