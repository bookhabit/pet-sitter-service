import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsDateString, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { PetSpecies } from '@prisma/client';

@InputType()
export class PetFilterInput {
  @Field(() => [PetSpecies], { nullable: true, description: '반려동물 종류 (Dog, Cat)' })
  @IsOptional()
  @IsEnum(PetSpecies, { each: true })
  species?: PetSpecies[];

  @Field(() => Int, { nullable: true, description: '반려동물 최소 나이' })
  @IsOptional()
  @IsInt()
  @Min(0)
  ageAbove?: number;

  @Field(() => Int, { nullable: true, description: '반려동물 최대 나이' })
  @IsOptional()
  @IsInt()
  @Min(0)
  ageBelow?: number;
}

@InputType()
export class JobFilterInput {
  @Field({ nullable: true, description: '시작 시간 이후 (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startTimeAfter?: string;

  @Field({ nullable: true, description: '시작 시간 이전 (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startTimeBefore?: string;

  @Field({ nullable: true, description: '종료 시간 이후 (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endTimeAfter?: string;

  @Field({ nullable: true, description: '종료 시간 이전 (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endTimeBefore?: string;

  @Field({ nullable: true, description: 'Activity 검색어 (포함 검색)' })
  @IsOptional()
  @IsString()
  activity?: string;

  @Field(() => PetFilterInput, { nullable: true, description: '반려동물 필터' })
  @IsOptional()
  pets?: PetFilterInput;
}
