import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-images.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'products' })
export class Product {
    
    @ApiProperty({ 
        example: '13281921-5e41-4534-95e3-4776c1f33551',
        description: 'ID de Producto',
        uniqueItems: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-shirt Title',
        description: 'Titulo de producto',
        uniqueItems: true,
    })
    @Column('text',{
        unique:true
    })
    title:string;

    @ApiProperty({
        example: 0,
        description: 'Precio del producto',
    })
    @Column('float',{
        default: 0
    })
    price:number

    @ApiProperty({
        example: 'Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto.',
        description: 'Descripcion del producto',
        default: null,
    })
    @Column('text', {
        nullable:true
    })
    descript:string;

    @ApiProperty({
        example: 'women_raven_joggers',
        description: 'Slog de Producto para el SEO',
        uniqueItems: true,
    })
    @Column('text', {
        unique:true
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Stock de Producto',
        default: 0,
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example:  ["XS","S","M","L","XL","XXL"],
        description: 'Tamaños del Producto',
    })
    @Column('text', {
        array:true
    })
    sizes: string[]

    @ApiProperty({
        example:  "Women",
        description: 'Generos de produto Producto',
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example:  ["shirt"],
        description: 'Tags del Producto',
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]

    // images
    @ApiProperty({
        example:  ["1740270-00-A_0_2000.jpg","1740270-00-A_1.jpg"],
        description: 'Imagenes del Producto',
    })
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
