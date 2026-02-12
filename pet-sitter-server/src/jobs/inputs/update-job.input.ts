import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsDateString, IsOptional, IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested, MinLength, MaxLength, IsNumber, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePetInput } from './create-pet.input';
import { PriceType } from '@prisma/client';

@InputType()
export class UpdateJobInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString({}, { message: 'start_time must be a valid ISO 8601 date-time string' })
  start_time?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString({}, { message: 'end_time must be a valid ISO 8601 date-time string' })
  end_time?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'activity must be a string' })
  @MinLength(5, { message: 'activity must be at least 5 characters long' })
  @MaxLength(500, { message: 'activity must not exceed 500 characters' })
  activity?: string;

  @Field(() => [CreatePetInput], { nullable: true })
  @IsOptional()
  @IsArray({ message: 'pets must be an array' })
  @ArrayMinSize(1, { message: 'pets must contain at least 1 element' })
  @ArrayMaxSize(10, { message: 'pets must contain no more than 10 elements' })
  @ValidateNested({ each: true })
  @Type(() => CreatePetInput)
  pets?: CreatePetInput[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @Field(() => PriceType, { nullable: true })
  @IsOptional()
  @IsEnum(PriceType)
  price_type?: PriceType;
}
