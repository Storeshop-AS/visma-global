import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany, JoinTable} from "typeorm";
import {Label} from "./label"

@Entity('Article')
export class Article extends BaseEntity {
    @PrimaryGeneratedColumn()
    Id!: number;

    @Column({unique: true, nullable: true})
    ExternalId!: string;

    @Column({unique: true, nullable: true})
    ExternalIdCMS!: string;

    @Column({unique: false, nullable: true})
    Number!: string;

    @Column({unique: false, nullable: true})
    GTIN!: string; // GTIN - Global Trade Item Number

    @Column({nullable: true})
    Syncronized!: boolean;

    @Column()
    Name!: string;

    @Column({nullable: true})
    NameEnglish!: string;

    @Column({type: 'boolean', nullable: true})
    IsActive!: boolean;

    @Column({type: 'decimal', nullable: true})
    NetPrice!: number;

    @Column({type: 'decimal', nullable: true})
    RecommendedPrice!: number;

    @Column({type: 'decimal', nullable: true})
    GrossPrice!: number;

    @Column({type: 'decimal', nullable: true})
    StockBalance!: number;

    @Column({type: 'decimal', nullable: true})
    StockBalanceReserved!: number;

    @Column({type: 'decimal', nullable: true})
    Vat!: number;

    @Column({type: 'decimal', nullable: true})
    VatB2C!: number;

    @Column({nullable: true})
    UnitType!: string;

    @Column({unique: false, nullable: true})
    Description!: string;

    @Column({unique: false, nullable: true})
    Summary!: string;

    @Column({type: 'timestamp', nullable: true})
    Updated!: Date;

    @Column({nullable: true})
    Warehouse!: string;

    @Column({nullable: true})
    ShowOnWeb!: string;

    @Column({nullable: true})
    ProcessingMethod7!: string

    @Column({nullable: true})
    ProductPriceGroup1!: string

    @Column({nullable: true})
    Group1!: string

    @Column({nullable: true})
    Group4!: string

    @Column({nullable: true})
    Group5!: string

    @Column({nullable: true})
    Group6!: string

    @Column({nullable: true})
    Group7!: string

    @Column({nullable: true})
    Information1!: string

    @Column({nullable: true})
    Information2!: string

    @Column({nullable: true})
    Information3!: string

    @Column({nullable: true})
    Information4!: string

    @ManyToMany(type => Label, label => label.Articles)
    @JoinTable()
    Labels!: Label[];
}
