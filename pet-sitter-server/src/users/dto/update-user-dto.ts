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
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'new@test.com', description: '변경할 이메일' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '김새이름', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  full_name?: string;

  @ApiPropertyOptional({ example: 'newpassword123', minLength: 8, maxLength: 20 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password?: string;

  @ApiPropertyOptional({ enum: Role, isArray: true, example: [Role.PetSitter] })
  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  roles?: Role[];
}
