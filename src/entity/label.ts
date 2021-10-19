import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany } from "typeorm";
import { Article } from "./article"

@Entity('Label')
export class Label extends BaseEntity {
    @PrimaryGeneratedColumn()
    Id!: number

    @Column({unique: true, nullable: true})
    ExternalId!: string

    @Column({ nullable: true })
    Syncronized!: boolean

    @Column()
    Name!: string

    @Column({nullable: true})
    Description!: string

    @ManyToMany(type => Article, article => article.Labels)
    Articles!: Article[];
}
