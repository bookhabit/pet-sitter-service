import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class ReviewModel {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  rating: number;

  @Field(() => String, { nullable: true })
  comment: string | null;

  @Field()
  reviewer_id: string;

  @Field()
  reviewee_id: string;

  @Field()
  job_id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
