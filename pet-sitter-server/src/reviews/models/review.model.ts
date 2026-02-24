import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class ReviewModel {
  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field(() => ID)
  id: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @Field(() => Int)
  rating: number;

  @ApiProperty({ example: '매우 친절하고 꼼꼼하게 돌봐주셨어요!', nullable: true })
  @Field(() => String, { nullable: true })
  comment: string | null;

  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field()
  reviewer_id: string;

  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field()
  reviewee_id: string;

  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field()
  job_id: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Field()
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Field()
  updatedAt: Date;
}
