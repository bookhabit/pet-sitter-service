import { IsString, IsDateString, IsOptional, IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested, MinLength, MaxLength, IsNumber, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PetDto } from './create-job-dto';
import { PriceType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateJobDto {
  @ApiPropertyOptional({ example: '2026-03-01T09:00:00Z', description: '시작 일시' })
  @IsOptional()
  @IsDateString({}, { message: 'start_time must be a valid ISO 8601 date-time string' })
  start_time?: string;

  @ApiPropertyOptional({ example: '2026-03-01T11:00:00Z', description: '종료 일시' })
  @IsOptional()
  @IsDateString({}, { message: 'end_time must be a valid ISO 8601 date-time string' })
  end_time?: string;

  @ApiPropertyOptional({ example: '수정된 공고 내용입니다', minLength: 5, maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'activity must be a string' })
  @MinLength(5, { message: 'activity must be at least 5 characters long' })
  @MaxLength(500, { message: 'activity must not exceed 500 characters' })
  activity?: string;

  @ApiPropertyOptional({ type: [PetDto], description: '반려동물 목록 교체' })
  @IsOptional()
  @IsArray({ message: 'pets must be an array' })
  @ArrayMinSize(1, { message: 'pets must contain at least 1 element' })
  @ArrayMaxSize(10, { message: 'pets must contain no more than 10 elements' })
  @ValidateNested({ each: true })
  @Type(() => PetDto)
  pets?: PetDto[];

  @ApiPropertyOptional({ example: '서울 강남구 역삼동' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 37.5012 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 127.0396 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 15000, minimum: 0, description: '가격 (원 단위)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ enum: PriceType, example: PriceType.hourly })
  @IsOptional()
  @IsEnum(PriceType)
  price_type?: PriceType;
}
