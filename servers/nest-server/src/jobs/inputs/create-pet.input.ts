import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsUUID, IsInt, Min, Max, IsEnum, IsOptional, IsArray, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { PetSpecies } from '@prisma/client';

@InputType()
export class CreatePetInput {
  @Field()
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name should not be empty' })
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  @MaxLength(20, { message: 'name must not exceed 20 characters' })
  name: string;

  @Field(() => Int)
  @IsInt({ message: 'age must be an integer' })
  @Min(1, { message: 'age must be at least 1' })
  @Max(100, { message: 'age must not exceed 100' })
  age: number;

  @Field(() => PetSpecies)
  @IsEnum(PetSpecies, { message: 'species must be either Cat or Dog' })
  species: PetSpecies;

  @Field()
  @IsString({ message: 'breed must be a string' })
  @IsNotEmpty({ message: 'breed should not be empty' })
  breed: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'size must be a string' })
  size?: string;

  @Field(() => [String], { nullable: true, description: '사전 업로드된 사진 ID 목록' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  photo_ids?: string[];
}
