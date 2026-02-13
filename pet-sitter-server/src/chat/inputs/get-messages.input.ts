import { InputType, Field, Int, ID } from '@nestjs/graphql';

@InputType()
export class GetMessagesInput {
  @Field(() => ID, { description: '채팅방 ID' })
  chatRoomId: string;

  @Field(() => Int, { nullable: true, defaultValue: 20, description: '조회할 메시지 수 (기본 20, 최대 100)' })
  limit?: number;

  @Field(() => String, { nullable: true, description: '커서 (메시지 UUID)' })
  cursor?: string;
}
