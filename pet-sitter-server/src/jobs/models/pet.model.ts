import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { PetSpecies } from '@prisma/client';
import { PhotoModel } from '../../photos/models/photo.model';

// Enum 등록 (GraphQL 스키마에 노출)
registerEnumType(PetSpecies, {
  name: 'PetSpecies',
  description: 'Pet species (Cat or Dog)',
});

@ObjectType()
export class PetModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  age: number;

  @Field(() => PetSpecies)
  species: PetSpecies;

  @Field()
  breed: string;

  @Field(() => String, { nullable: true })
  size: string | null;

  @Field()
  job_id: string;

  @Field(() => [PhotoModel], { description: '반려동물에 첨부된 사진 목록' })
  photos: PhotoModel[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
