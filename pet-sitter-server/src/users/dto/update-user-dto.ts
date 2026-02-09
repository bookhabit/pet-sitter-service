import { Role } from '@prisma/client';
import {
  IsString,
  IsEmail,
  IsArray,
  IsEnum,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  full_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  roles?: Role[];
}
