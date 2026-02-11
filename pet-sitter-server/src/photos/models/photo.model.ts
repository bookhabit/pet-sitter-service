import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class PhotoModel {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field()
  file_name: string;

  @Field()
  original_name: string;

  @Field()
  mime_type: string;

  @Field(() => Int)
  size: number;

  @Field()
  uploader_id: string;

  @Field(() => String, { nullable: true })
  user_id: string | null;

  @Field(() => String, { nullable: true })
  job_id: string | null;

  @Field(() => String, { nullable: true })
  pet_id: string | null;

  @Field()
  createdAt: Date;
}
