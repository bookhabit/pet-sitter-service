import { ObjectType, Field } from '@nestjs/graphql';
import { MessageModel } from './message.model';

@ObjectType()
export class PaginatedMessages {
  @Field(() => [MessageModel], { description: '메시지 목록' })
  messages: MessageModel[];

  @Field(() => String, { nullable: true, description: '다음 페이지 커서' })
  nextCursor: string | null;
}
