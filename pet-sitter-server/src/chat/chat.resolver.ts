import { Args, Query, Resolver } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { ChatRoomModel } from './models/chat-room.model';
import { PaginatedMessages } from './models/paginated-messages.model';
import { GetMessagesInput } from './inputs/get-messages.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Resolver()
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Query(() => [ChatRoomModel], { description: '내 채팅방 목록' })
  myChatRooms(@CurrentUser() user: User) {
    return this.chatService.findMyChatRooms(user.id);
  }

  @Query(() => PaginatedMessages, { description: '채팅방 메시지 히스토리' })
  chatRoomMessages(
    @Args('input') input: GetMessagesInput,
    @CurrentUser() user: User,
  ) {
    return this.chatService.findMessages(
      input.chatRoomId,
      user.id,
      input.limit,
      input.cursor,
    );
  }
}
