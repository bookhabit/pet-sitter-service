import { IsString, IsUUID, IsDateString, IsNotEmpty, IsInt, Min, Max, IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested, IsEnum, IsOptional, MinLength, MaxLength, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PetSpecies, PriceType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PetDto {
    @ApiProperty({ example: '뽀삐', minLength: 2, maxLength: 20, description: '반려동물 이름' })
    @IsString({ message: 'name must be a string' })
    @IsNotEmpty({ message: 'name should not be empty' })
    @MinLength(2, { message: 'name must be at least 2 characters long' })
    @MaxLength(20, { message: 'name must not exceed 20 characters' })
    name: string;

    @ApiProperty({ example: 3, minimum: 1, maximum: 100, description: '나이' })
    @IsInt({ message: 'age must be an integer' })
    @Min(1, { message: 'age must be at least 1' })
    @Max(100, { message: 'age must not exceed 100' })
    age: number;

    @ApiProperty({ enum: PetSpecies, example: PetSpecies.Dog, description: '종류 (Cat / Dog)' })
    @IsEnum(PetSpecies, { message: 'species must be either Cat or Dog' })
    species: PetSpecies;

    @ApiProperty({ example: '골든 리트리버', description: '품종' })
    @IsString({ message: 'breed must be a string' })
    @IsNotEmpty({ message: 'breed should not be empty' })
    breed: string;

    @ApiPropertyOptional({ example: '대형', description: '크기 (소형/중형/대형 등)' })
    @IsOptional()
    @IsString({ message: 'size must be a string' })
    size?: string;

    @ApiPropertyOptional({ type: [String], format: 'uuid', description: 'POST /photos/upload 으로 사전 업로드한 Photo ID 목록' })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    photo_ids?: string[];
}

export class CreateJobDto {
    @ApiProperty({ example: '2026-03-01T09:00:00Z', description: '시작 일시 (ISO 8601)' })
    @IsDateString({}, { message: 'start_time must be a valid ISO 8601 date-time string' })
    start_time: string;

    @ApiProperty({ example: '2026-03-01T11:00:00Z', description: '종료 일시 (ISO 8601)' })
    @IsDateString({}, { message: 'end_time must be a valid ISO 8601 date-time string' })
    end_time: string;

    @ApiProperty({ example: '말티즈 홈케어 서비스 구합니다', minLength: 5, maxLength: 500, description: '공고 내용' })
    @IsString({ message: 'activity must be a string' })
    @IsNotEmpty({ message: 'activity should not be empty' })
    @MinLength(5, { message: 'activity must be at least 5 characters long' })
    @MaxLength(500, { message: 'activity must not exceed 500 characters' })
    activity: string;

    @ApiProperty({ type: [PetDto], description: '반려동물 목록 (1~10마리)' })
    @IsArray({ message: 'pets must be an array' })
    @ArrayMinSize(1, { message: 'pets must contain at least 1 element' })
    @ArrayMaxSize(10, { message: 'pets must contain no more than 10 elements' })
    @ValidateNested({ each: true })
    @Type(() => PetDto)
    pets: PetDto[];

    @ApiPropertyOptional({ type: [String], format: 'uuid', description: 'POST /photos/upload 으로 사전 업로드한 공고 사진 ID 목록' })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    photo_ids?: string[];

    @ApiPropertyOptional({ example: '서울 강남구 역삼동', description: '공고 위치 주소' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ example: 37.5012, description: '위도 (WGS84)' })
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional({ example: 127.0396, description: '경도 (WGS84)' })
    @IsOptional()
    @IsNumber()
    longitude?: number;

    @ApiPropertyOptional({ example: 15000, minimum: 0, description: '가격 (원 단위)' })
    @IsOptional()
    @IsInt()
    @Min(0)
    price?: number;

    @ApiPropertyOptional({ enum: PriceType, example: PriceType.hourly, description: '가격 단위 (hourly: 시간당 / daily: 일당)' })
    @IsOptional()
    @IsEnum(PriceType)
    price_type?: PriceType;
}