import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { UserModel } from '../../users/models/user.model';

@ObjectType()
export class MessageModel {
  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field(() => ID)
  id: string;

  @ApiProperty({ example: '안녕하세요!' })
  @Field()
  content: string;

  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field()
  sender_id: string;

  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field()
  chat_room_id: string;

  @ApiProperty({ type: () => UserModel, nullable: true })
  @Field(() => UserModel, { nullable: true })
  sender?: UserModel;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Field()
  createdAt: Date;
}
