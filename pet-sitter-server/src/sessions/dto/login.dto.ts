import { IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @ApiProperty({ example: 'owner1@test.com', description: '이메일' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', description: '비밀번호' })
    password: string;
}