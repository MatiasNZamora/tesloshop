import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';

import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class SeedService {
  constructor(
    private readonly productService:ProductsService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ){}
  
    async runSeed(){
      await this.deleteTable();

      const adminUser = await this.insertUser(); // insertando usuarios.

      await this.insertNewProducts( adminUser ); // insertando productos.
      return 'Seed executed';
    };

    private async deleteTable(){
      await this.productService.deleteAllProductS();

      const queryBuilder = this.userRepository.createQueryBuilder();
      await queryBuilder
        .delete()
        .where({})
        .execute()
    }
    
    private async insertUser(){
    
      const seedUsers = initialData.users;

      const users: User[] = [];

      seedUsers.forEach( user => {
        users.push( this.userRepository.create(user) )
      });

      const dbUsers = await this.userRepository.save( seedUsers );

      return dbUsers[0];
    
    };

    private async insertNewProducts( user: User) {
      await this.productService.deleteAllProductS();

      const products = initialData.products;

      const insertPromises = [];

      products.forEach( product => {
        insertPromises.push( this.productService.create( product, user ) );
      });

      await Promise.all( insertPromises );

      return true;
    };

};
