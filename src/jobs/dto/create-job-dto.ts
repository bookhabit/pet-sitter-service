import { IsString, IsDateString, IsNotEmpty, IsInt, Min, Max, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DogDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @Min(0)
    @Max(30)
    age: number;

    @IsString()
    @IsNotEmpty()
    breed: string;

    @IsString()
    @IsNotEmpty()
    size: string;
}

export class CreateJobDto {
    @IsDateString()
    start_time: string;

    @IsDateString()
    end_time: string;

    @IsString()
    @IsNotEmpty()
    activity: string;

    @IsObject()
    @ValidateNested()
    @Type(() => DogDto)
    dog: DogDto;
}