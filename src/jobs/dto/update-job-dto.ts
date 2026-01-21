import { IsString, IsDateString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DogDto } from './create-job-dto';

export class UpdateJobDto {
  @IsOptional()
  @IsDateString()
  start_time?: string;

  @IsOptional()
  @IsDateString()
  end_time?: string;

  @IsOptional()
  @IsString()
  activity?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DogDto)
  dog?: DogDto;
}
