import { Role } from '@prisma/client';
import {
    IsString,
    IsEmail,
    IsInt,
    Min,
    MaxLength,
    IsOptional,
    IsArray,
    IsEnum
  } from 'class-validator';
  
  export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MaxLength(20)
    full_name: string;
  
    @IsString()
    @MaxLength(20)
    password: string;

    @IsArray()
    @IsEnum(Role, { each: true })
    roles: Role[];
  }
  