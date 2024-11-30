import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';

import { JwtStrategy } from './statrgies/jwt.strategy';

@Module({
  
  controllers: [AuthController],
  
  providers: [ AuthService, JwtStrategy ],
  
  imports:[
    
    ConfigModule,

    TypeOrmModule.forFeature([ User ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      
      imports:[ ConfigModule ],
      inject:[ ConfigService ],
      
      useFactory: ( configService: ConfigService ) => {

        //? dos formas distintas para traer y validar las variables de entorno
        // console.log( 'JWTSecret:',configService.get('JWT_SECRET') )
        // console.log( 'JWTSecret:',process.env.JWT_SECRET )

        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: '2h' },
        };

      }

    })

  ],

  exports: [ 
    TypeOrmModule, 
    JwtStrategy, 
    PassportModule, 
    JwtModule 
  ]

})

export class AuthModule {};