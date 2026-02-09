import { IsString, IsDateString, IsOptional, IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PetDto } from './create-job-dto';

export class UpdateJobDto {
  @IsOptional()
  @IsDateString({}, { message: 'start_time must be a valid ISO 8601 date-time string' })
  start_time?: string;

  @IsOptional()
  @IsDateString({}, { message: 'end_time must be a valid ISO 8601 date-time string' })
  end_time?: string;

  @IsOptional()
  @IsString({ message: 'activity must be a string' })
  @MinLength(5, { message: 'activity must be at least 5 characters long' })
  @MaxLength(500, { message: 'activity must not exceed 500 characters' })
  activity?: string;

  @IsOptional()
  @IsArray({ message: 'pets must be an array' })
  @ArrayMinSize(1, { message: 'pets must contain at least 1 element' })
  @ArrayMaxSize(10, { message: 'pets must contain no more than 10 elements' })
  @ValidateNested({ each: true })
  @Type(() => PetDto)
  pets?: PetDto[];
}
