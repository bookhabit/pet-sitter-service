import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { PetModel } from './pet.model';
import { PhotoModel } from '../../photos/models/photo.model';
import { PriceType } from '@prisma/client';

registerEnumType(PriceType, { name: 'PriceType' });

@ObjectType()
export class JobModel {
  @Field(() => ID)
  id: string;

  @Field()
  creator_user_id: string;

  @Field()
  start_time: Date;

  @Field()
  end_time: Date;

  @Field()
  activity: string;

  @Field(() => String, { nullable: true })
  address: string | null;

  @Field(() => Float, { nullable: true })
  latitude: number | null;

  @Field(() => Float, { nullable: true })
  longitude: number | null;

  @Field(() => Int, { nullable: true })
  price: number | null;

  @Field(() => PriceType, { nullable: true })
  price_type: PriceType | null;

  @Field(() => [PetModel])
  pets: PetModel[];

  @Field(() => [PhotoModel], { description: '공고에 첨부된 사진 목록' })
  photos: PhotoModel[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
