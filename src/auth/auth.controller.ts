import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';

import { GetUser } from './decorators/get-user.decorator';

import { User } from './entities/user.entity';



@Controller('auth')
export class AuthController {
  
  constructor( private readonly authService: AuthService ) {}

  @Post('register')
  create( @Body() payload: CreateUserDto ) {
    return this.authService.create(payload);
  }

  @Post('login')
  loginUser( @Body() payload: LoginUserDto ){
    return this.authService.login(payload);
  };

  @Get('private')
  @UseGuards( AuthGuard() )
  PrivateRoute( @GetUser() user: User ){

    return {
      ok:true,  
      message: 'private route',
      user,
    };

  };
}
