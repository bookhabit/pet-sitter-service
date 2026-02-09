import { ObjectType, Field, ID } from '@nestjs/graphql';
import { PetModel } from './pet.model';

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

  @Field(() => [PetModel])
  pets: PetModel[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
