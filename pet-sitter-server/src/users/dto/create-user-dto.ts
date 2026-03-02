import { Role } from '@prisma/client';
import {
    IsString,
    IsEmail,
    IsArray,
    IsEnum,
    MaxLength,
    MinLength,
    ArrayMinSize,
    Matches
  } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'owner1@test.com', description: '이메일 주소' })
    @IsEmail({}, { message: 'email must be a valid email address' })
    email: string;

    @ApiProperty({ example: '김주인', minLength: 2, maxLength: 50 })
    @IsString({ message: 'full_name must be a string' })
    @MinLength(2, { message: 'full_name must be at least 2 characters long' })
    @MaxLength(50, { message: 'full_name must not exceed 50 characters' })
    @Matches(/^[^\d]+$/, { message: 'full_name must not contain numbers' })
    full_name: string;

    @ApiProperty({ example: 'password123', minLength: 8, description: '비밀번호 (최소 8자)' })
    @IsString({ message: 'password must be a string' })
    @MinLength(8, { message: 'password must be at least 8 characters long' })
    password: string;

    @ApiProperty({ enum: Role, isArray: true, example: [Role.PetOwner], description: '역할 목록 (PetOwner, PetSitter, Admin)' })
    @IsArray({ message: 'roles must be an array' })
    @ArrayMinSize(1, { message: 'roles must contain at least one role' })
    @IsEnum(Role, { each: true, message: 'Each role must be one of: PetOwner, PetSitter, Admin' })
    roles: Role[];
  }
  