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
    @IsEmail({}, { message: 'email must be a valid email address' })
    email: string;

    @IsString({ message: 'full_name must be a string' })
    @MinLength(2, { message: 'full_name must be at least 2 characters long' })
    @MaxLength(50, { message: 'full_name must not exceed 50 characters' })
    full_name: string;
  
    @IsString({ message: 'password must be a string' })
    @MinLength(8, { message: 'password must be at least 8 characters long' })
    password: string;

    @IsArray({ message: 'roles must be an array' })
    @IsEnum(Role, { each: true, message: 'Each role must be one of: PetOwner, PetSitter, Admin' })
    roles: Role[];
  }
  