import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { PetSpecies } from '@prisma/client';
import { PhotoModel } from '../../photos/models/photo.model';

// Enum 등록 (GraphQL 스키마에 노출)
registerEnumType(PetSpecies, {
  name: 'PetSpecies',
  description: 'Pet species (Cat or Dog)',
});

@ObjectType()
export class PetModel {
  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field(() => ID)
  id: string;

  @ApiProperty({ example: '뽀삐' })
  @Field()
  name: string;

  @ApiProperty({ example: 3 })
  @Field(() => Int)
  age: number;

  @ApiProperty({ enum: PetSpecies, example: PetSpecies.Dog })
  @Field(() => PetSpecies)
  species: PetSpecies;

  @ApiProperty({ example: '골든 리트리버' })
  @Field()
  breed: string;

  @ApiProperty({ example: '대형', nullable: true })
  @Field(() => String, { nullable: true })
  size: string | null;

  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field()
  job_id: string;

  @ApiProperty({ type: [PhotoModel], description: '반려동물에 첨부된 사진 목록' })
  @Field(() => [PhotoModel], { description: '반려동물에 첨부된 사진 목록' })
  photos: PhotoModel[];

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Field()
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Field()
  updatedAt: Date;
}
