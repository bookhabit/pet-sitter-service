import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserModel } from '../../users/models/user.model';

@ObjectType()
export class MessageModel {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field()
  sender_id: string;

  @Field()
  chat_room_id: string;

  @Field(() => UserModel, { nullable: true })
  sender?: UserModel;

  @Field()
  createdAt: Date;
}
