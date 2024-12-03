import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const GetUser = createParamDecorator(
    ( data: string, ctx: ExecutionContext ) => {

        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if(!user) 
            throw new InternalServerErrorException('User not found (Request)');

        return ( !data ) ? user : user[data]; // utilizo un operador ternario... si no viene la data envio el usuario caso contrario envio el usuario con la data.

    }
);