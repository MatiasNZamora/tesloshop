import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { Product } from './entities/product.entity';
import { validate as IsUUID } from 'uuid';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepository:Repository<Product>
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
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    
    } catch (error) {
      this.handleDbExeptions(error);
    }
  }

  findAll(paginationDto:PaginationDto) {
    
    const {limit=10, offset=0 } = paginationDto;

    return this.productRepository.find({
      take: limit,
      skip: offset
      //todo: relaciones
    });
  }

  async findOne( term: string ) {

    let productFound: Product;

    if(IsUUID(term)){
      productFound = await this.productRepository.findOneBy({ id: term })
    } else {
      // utilizo querybuilder
      const queryBuilder = this.productRepository.createQueryBuilder();
      productFound = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        }).getOne()
    }
    
    if(!productFound) throw new NotFoundException(`Product wih ${term} not found`);
    
    return productFound;
  
  }

  async update( id: string, payload: UpdateProductDto) {
    
    const product = await this.productRepository.preload({
      id: id,
      ...payload
    });

    if(!product) throw new NotFoundException(`Product with id ${id} not found`);
    
    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDbExeptions(error)
    }

  }

  async remove(id: string ) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return product;
  }

}

