import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-images.entity";
import { User } from "src/auth/entities/user.entity";

@Entity({ name: 'products' })
export class Product {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
        unique:true
    })
    title:string;

    @Column('float',{
        default: 0
    })
    price:number

    @Column('text', {
        nullable:true
    })
    descript:string;

    @Column('text', {
        unique:true
    })
    slug: string;

    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text', {
        array:true
    })
    sizes: string[]

    @Column('text')
    gender: string;

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]

    // images
    @OneToMany( 
        () => ProductImage,
        (productImage) => productImage.product,
        {
            cascade: true,
            eager: true,
        }
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager:true }  
    )
    user:User

    @BeforeInsert()
    checkSlogInsert(){
        if(!this.slug){
            this.slug = this.title
        }
        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

    @BeforeUpdate()
    checkLogUpdate(){
        this.slug = this.slug
            .toLocaleLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

};
