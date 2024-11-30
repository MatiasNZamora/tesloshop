import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';

import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtServide: JwtService,
  ){}

  async create( data: CreateUserDto ) {
    
    try {

      const { password, ...userData } = data;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10 )
      });

      await this.userRepository.save(user)
      delete user.password; // en la respuesta de posman le quito el apartado de password.
      
      return {
        ...user,
        token: this.getJwToken({ id: user.id }),
      };
    
    } catch (e) {
      this.handleDbError(e);
    }
  };

  async login ( data: LoginUserDto ){
    
    const { password, email } = data;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if(!user) // comparacion de usuario 
      throw new UnauthorizedException('Credentials are not valid (Email)')

    if( !bcrypt.compareSync( password, user.password )) // comparacion de password
      throw new UnauthorizedException('Credentials are not valid (Password)')


    return {
      ...user,
      token: this.getJwToken({ id: user.id }),
    };

  };
  
  private getJwToken ( payload: JwtPayload ){
    const token = this.jwtServide.sign( payload );
    return token;
  };


  private handleDbError (error:any): never {
    
    if (error.code === '23505') throw new BadRequestException( error.detail );

    console.log(error);

    throw new InternalServerErrorException('Plase check server logs');
  
  };
  

};
