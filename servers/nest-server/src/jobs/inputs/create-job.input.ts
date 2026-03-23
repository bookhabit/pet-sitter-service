import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsUUID, IsDateString, IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested, MinLength, MaxLength, IsNotEmpty, IsOptional, IsNumber, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePetInput } from './create-pet.input';
import { PriceType } from '@prisma/client';

@InputType()
export class CreateJobInput {
  @Field()
  @IsDateString({}, { message: 'start_time must be a valid ISO 8601 date-time string' })
  start_time: string;

  @Field()
  @IsDateString({}, { message: 'end_time must be a valid ISO 8601 date-time string' })
  end_time: string;

  @Field()
  @IsString({ message: 'activity must be a string' })
  @IsNotEmpty({ message: 'activity should not be empty' })
  @MinLength(5, { message: 'activity must be at least 5 characters long' })
  @MaxLength(500, { message: 'activity must not exceed 500 characters' })
  activity: string;

  @Field(() => [CreatePetInput])
  @IsArray({ message: 'pets must be an array' })
  @ArrayMinSize(1, { message: 'pets must contain at least 1 element' })
  @ArrayMaxSize(10, { message: 'pets must contain no more than 10 elements' })
  @ValidateNested({ each: true })
  @Type(() => CreatePetInput)
  pets: CreatePetInput[];

  @Field(() => [String], { nullable: true, description: '사전 업로드된 공고 사진 ID 목록' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  photo_ids?: string[];

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
