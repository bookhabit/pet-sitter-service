import { Role } from '@prisma/client';
import {
    IsString,
    IsEmail,
    IsArray,
    IsEnum,
    MaxLength,
    MinLength
  } from 'class-validator';
  
  export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MaxLength(20)
    full_name: string;
  
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    password: string;

    @IsArray()
    @IsEnum(Role, { each: true })
    roles: Role[];
  }
  