import { IsString, IsUUID, IsDateString, IsNotEmpty, IsInt, Min, Max, IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PetSpecies } from '@prisma/client';

export class PetDto {
    @IsString({ message: 'name must be a string' })
    @IsNotEmpty({ message: 'name should not be empty' })
    @MinLength(2, { message: 'name must be at least 2 characters long' })
    @MaxLength(20, { message: 'name must not exceed 20 characters' })
    name: string;

    @IsInt({ message: 'age must be an integer' })
    @Min(1, { message: 'age must be at least 1' })
    @Max(100, { message: 'age must not exceed 100' })
    age: number;

    @IsEnum(PetSpecies, { message: 'species must be either Cat or Dog' })
    species: PetSpecies;

    @IsString({ message: 'breed must be a string' })
    @IsNotEmpty({ message: 'breed should not be empty' })
    breed: string;

    @IsOptional()
    @IsString({ message: 'size must be a string' })
    size?: string;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    photo_ids?: string[];
}

export class CreateJobDto {
    @IsDateString({}, { message: 'start_time must be a valid ISO 8601 date-time string' })
    start_time: string;

    @IsDateString({}, { message: 'end_time must be a valid ISO 8601 date-time string' })
    end_time: string;

    @IsString({ message: 'activity must be a string' })
    @IsNotEmpty({ message: 'activity should not be empty' })
    @MinLength(5, { message: 'activity must be at least 5 characters long' })
    @MaxLength(500, { message: 'activity must not exceed 500 characters' })
    activity: string;

    @IsArray({ message: 'pets must be an array' })
    @ArrayMinSize(1, { message: 'pets must contain at least 1 element' })
    @ArrayMaxSize(10, { message: 'pets must contain no more than 10 elements' })
    @ValidateNested({ each: true })
    @Type(() => PetDto)
    pets: PetDto[];

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    photo_ids?: string[];
}