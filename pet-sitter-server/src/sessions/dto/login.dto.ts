import { IsEmail } from "class-validator";
import { PickType } from "@nestjs/mapped-types";
import { CreateUserDto } from "../../users/dto/create-user-dto";

export class LoginDto extends PickType(CreateUserDto, ['password'] as const) {
    @IsEmail()
    email: string;
}