import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { PetModel } from './pet.model';
import { PhotoModel } from '../../photos/models/photo.model';
import { PriceType } from '@prisma/client';

registerEnumType(PriceType, { name: 'PriceType' });

@ObjectType()
export class JobModel {
  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field(() => ID)
  id: string;

  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field()
  creator_user_id: string;

  @ApiProperty({ example: '2026-03-01T09:00:00.000Z' })
  @Field()
  start_time: Date;

  @ApiProperty({ example: '2026-03-01T11:00:00.000Z' })
  @Field()
  end_time: Date;

  @ApiProperty({ example: '말티즈 홈케어 서비스 구합니다' })
  @Field()
  activity: string;

  @ApiProperty({ example: '서울 강남구 역삼동', nullable: true })
  @Field(() => String, { nullable: true })
  address: string | null;

  @ApiProperty({ example: 37.5012, nullable: true })
  @Field(() => Float, { nullable: true })
  latitude: number | null;

  @ApiProperty({ example: 127.0396, nullable: true })
  @Field(() => Float, { nullable: true })
  longitude: number | null;

  @ApiProperty({ example: 15000, nullable: true })
  @Field(() => Int, { nullable: true })
  price: number | null;

  @ApiProperty({ enum: PriceType, nullable: true, example: PriceType.hourly })
  @Field(() => PriceType, { nullable: true })
  price_type: PriceType | null;

  @ApiProperty({ type: [PetModel] })
  @Field(() => [PetModel])
  pets: PetModel[];

  @ApiProperty({ type: [PhotoModel], description: '공고에 첨부된 사진 목록' })
  @Field(() => [PhotoModel], { description: '공고에 첨부된 사진 목록' })
  photos: PhotoModel[];

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Field()
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Field()
  updatedAt: Date;
}
