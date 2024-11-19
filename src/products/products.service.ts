import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { Product } from './entities/product.entity';
import { validate as IsUUID } from 'uuid';
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepository:Repository<Product>,
    @InjectRepository(ProductImage) private readonly productImageRepository:Repository<ProductImage>,
    private readonly dataSorce:DataSource,
  ){}

  private readonly logger = new Logger('ProductService'); // libreria que me permite ver mas claramente el error con el logger de nest.

  private handleDbExeptions(error:any){
    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error); // nos permite ver claramente el error 
    throw new InternalServerErrorException('Unexpected error check logs');
  };

  async create(createProductDto: CreateProductDto) {
    
    try {
      const {images = [],  ...productPropertis } = createProductDto;

      const product = this.productRepository.create({
        ...productPropertis,
        images: images.map( image => this.productImageRepository.create({ url: image }) )
      });
      await this.productRepository.save(product);
      return {...product, images: images};
    
    } catch (error) {
      this.handleDbExeptions(error);
    }
  }

  async findAll(paginationDto:PaginationDto) {
    
    const {limit=10, offset=0 } = paginationDto;

    const product = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true, 
      }
    });

    return product.map( ( product ) => ({
      ...product,
      images: product.images.map( img => img.url ),
    }))
  }

  async findOne( term: string ) {

    let productFound: Product;

    if(IsUUID(term)){
      productFound = await this.productRepository.findOneBy({ id: term })
    } else {
      // utilizo querybuilder
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      productFound = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect( 'prod.images', 'prodImages' )
        .getOne()
    }
    
    if(!productFound) throw new NotFoundException(`Product wih ${term} not found`);
    
    return productFound;
  
  }

  async findOnePlain(term){
    const { images = [], ...rest } = await this.findOne(term);

    return {
      ...rest,
      images: images.map( img => img.url )
    }
  };

  async update( id: string, payload: UpdateProductDto) {

    const { images , ...toUpdate } = payload;
    
    const product = await this.productRepository.preload({ id, ...toUpdate });

    if(!product) throw new NotFoundException(`Product with id ${id} not found`);

    const queryRuner = this.dataSorce.createQueryRunner();
    await queryRuner.connect();
    await queryRuner.startTransaction();

    try {
      if(images){
        await queryRuner.manager.delete( ProductImage, { product: { id } })
        product.images = images.map( img => this.productImageRepository.create( { url: img } ))
      }

      await queryRuner.manager.save(product);

      await queryRuner.commitTransaction();
      await queryRuner.release();

      return this.findOnePlain( id );

    } catch (error) {
      await queryRuner.rollbackTransaction();
      await queryRuner.release();
      this.handleDbExeptions(error);
    }

  }

  async remove(id: string ) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return product;
  }


  async deleteAllProductS(){
    const query = this.productRepository.createQueryBuilder('product');
  
    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleDbExeptions(error);
    }
  
  };


}

