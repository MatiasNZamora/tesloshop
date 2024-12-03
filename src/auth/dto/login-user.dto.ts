import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginUserDto {

    @ApiProperty({
        description: 'Email de usuario (unique)',
        uniqueItems: true,
    })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Password del usuario (Hasheado)',
        example: '$2b$10$6cQ1jO9Q6qh7DdFa0HW7QefMi1yTAkiFMPOr6bXNRIexKCmY4QYhO',
    })
    @IsString()
    @MinLength(4)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
            message: 'The password must have a Uppercase, lowercase letter and a number'
        }
    )
    password:string;

}