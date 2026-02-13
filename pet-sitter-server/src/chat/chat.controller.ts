import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Chat')
@ApiBearerAuth('access-token')
@Controller('chat-rooms')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOperation({ summary: '내 채팅방 목록 (최근 메시지 + 안읽은 수 포함)' })
  @ApiResponse({ status: 200, description: 'OK' })
  findMyChatRooms(@CurrentUser() user: User) {
    return this.chatService.findMyChatRooms(user.id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: '메시지 히스토리 (커서 기반 페이지네이션)' })
  @ApiParam({ name: 'id', description: '채팅방 UUID' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 403, description: '채팅방 접근 권한 없음' })
  findMessages(
    @Param('id') chatRoomId: string,
    @Query() query: GetMessagesQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.chatService.findMessages(
      chatRoomId,
      user.id,
      query.limit,
      query.cursor,
    );
  }
}
