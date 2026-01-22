import { IsString, IsDateString, IsNotEmpty, IsInt, Min, Max, IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum PetSpecies {
    Cat = 'Cat',
    Dog = 'Dog',
}

export class PetDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @Min(1)
    @Max(100)
    age: number;

    @IsEnum(PetSpecies)
    species: PetSpecies;

    @IsString()
    @IsNotEmpty()
    breed: string;

    @IsString()
    @IsOptional()
    size?: string;
}

export class CreateJobDto {
    @IsDateString()
    start_time: string;

    @IsDateString()
    end_time: string;

    @IsString()
    @IsNotEmpty()
    activity: string;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(10)
    @ValidateNested({ each: true })
    @Type(() => PetDto)
    pets: PetDto[];
}