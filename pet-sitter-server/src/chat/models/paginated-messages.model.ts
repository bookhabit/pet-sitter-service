import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { MessageModel } from './message.model';

@ObjectType()
export class PaginatedMessages {
  @ApiProperty({ type: [MessageModel], description: '메시지 목록' })
  @Field(() => [MessageModel], { description: '메시지 목록' })
  messages: MessageModel[];

  @ApiProperty({ example: 'cursor-string', nullable: true, description: '다음 페이지 커서' })
  @Field(() => String, { nullable: true, description: '다음 페이지 커서' })
  nextCursor: string | null;
}
