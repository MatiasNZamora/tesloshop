import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';

import { GetUser, RawHeaders, RoleProtected, Auth } from './decorators';

import { User } from './entities/user.entity';
import { UseRoleGuard } from './guards/use-role/use-role.guard';
import { validRoles } from './interfaces';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  
  constructor( private readonly authService: AuthService ) {}

  @Post('register')
  create( @Body() payload: CreateUserDto ) {
    return this.authService.create(payload);
  };

  @Post('login')
  loginUser( @Body() payload: LoginUserDto ){
    return this.authService.login(payload);
  };

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus( user );
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  PrivateRoute( 
    @Req() request: Express.Request, 
    @RawHeaders() rawHeaders: string[],  // Custom decorator
    @GetUser() user: User,                  // Custom decorator
    @GetUser('email') userEmail: string,  // Custom decorator
  ){
    // console.log(request); 
    return {
      ok:true,  
      message: 'private route',
      user,
      userEmail,
      rawHeaders
    };
  };

  // @SetMetadata('roles', ['admin', 'super-user'])

  @Get('private2')
  @RoleProtected( validRoles.superUser, validRoles.admin, validRoles.user )
  @UseGuards( AuthGuard(), UseRoleGuard )
  PrivateRoute2(
    @GetUser() user: User,
  ){

    return {
      ok:true,  
      user,
    };
  }


  @Get('private3')
  @Auth( validRoles.admin )
  privateRoute3(  @GetUser() user: User, ){
    return {
      ok:true,  
      user,
    };
  }
}
