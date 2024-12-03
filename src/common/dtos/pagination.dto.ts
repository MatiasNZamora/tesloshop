import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto { 

    @ApiProperty({
        default: 10, description: 'Cuantos elementos quieres mostrar'
    })
    @IsOptional()
    @IsPositive()
    //transformar la data
    @Type( () => Number ) //enableImplicitConversions: true
    limit?: number;

    @ApiProperty({
        default: 0, description: 'De que punto del Array quieres comenzar a contar'
    })
    @IsOptional()
    @Min(0)
    @Type( () => Number ) //enableImplicitConversions: true
    offset?: number;

};