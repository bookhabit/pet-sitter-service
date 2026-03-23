import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from './chat.service';
import { Public } from '../auth/decorators/public.decorator';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 연결 시 JWT 검증 + 세션 확인
   */
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.emit('error', { message: 'Token is missing' });
        client.disconnect();
        return;
      }

      const ACCESS_SECRET =
        process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'access-secret-key';

      const decoded = jwt.verify(token, ACCESS_SECRET) as {
        userId: string;
        email: string;
        type: string;
      };

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        client.emit('error', { message: 'User not found' });
        client.disconnect();
        return;
      }

      // 세션 존재 여부 확인 (로그아웃 여부 체크)
      const session = await this.prisma.session.findUnique({
        where: { user_id: user.id },
      });

      if (!session) {
        client.emit('error', { message: 'Session not found' });
        client.disconnect();
        return;
      }

      client.data.user = user;
      // 소켓 연결 즉시 유저 개인 룸 입장 — 채팅방 밖에서도 알림 수신 가능
      client.join(`user:${user.id}`);
    } catch (error) {
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // 연결 해제 시 특별한 처리 없음
  }

  /**
   * 채팅방 입장 + 읽음처리
   */
  @Public()
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { jobApplicationId: string },
  ) {
    try {
      const user = client.data.user;
      if (!user) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      const chatRoom = await this.chatService.joinRoom(
        payload.jobApplicationId,
        user.id,
      );

      // Socket.io 룸 입장
      client.join(chatRoom.id);

      // 읽음처리
      const lastReadAt = await this.chatService.markAsRead(
        chatRoom.id,
        user.id,
      );

      // 읽음 상태 알림
      this.server.to(chatRoom.id).emit('messagesRead', {
        chatRoomId: chatRoom.id,
        userId: user.id,
        lastReadAt,
      });

      // 입장 확인
      client.emit('joinedRoom', {
        chatRoomId: chatRoom.id,
        jobApplicationId: payload.jobApplicationId,
      });
    } catch (error) {
      client.emit('error', { message: error.message || 'Failed to join room' });
    }
  }

  /**
   * 메시지 전송 + 읽음처리
   */
  @Public()
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatRoomId: string; content: string },
  ) {
    try {
      const user = client.data.user;
      if (!user) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      // 메시지 저장
      const message = await this.chatService.sendMessage(
        payload.chatRoomId,
        payload.content,
        user.id,
      );

      // 메시지 브로드캐스트
      this.server.to(payload.chatRoomId).emit('receiveMessage', message);

      // 발신자 읽음처리
      const senderReadAt = await this.chatService.markAsRead(
        payload.chatRoomId,
        user.id,
      );

      // 상대방이 room에 접속해 있는지 확인
      const recipientId = await this.chatService.getRecipientId(
        payload.chatRoomId,
        user.id,
      );

      const socketsInRoom = await this.server
        .in(payload.chatRoomId)
        .fetchSockets();
      const recipientInRoom = socketsInRoom.some(
        (s) => s.data.user?.id === recipientId,
      );

      if (recipientInRoom) {
        // 상대방도 room에 있으면 상대방 읽음처리
        const recipientReadAt = await this.chatService.markAsRead(
          payload.chatRoomId,
          recipientId,
        );

        this.server.to(payload.chatRoomId).emit('messagesRead', {
          chatRoomId: payload.chatRoomId,
          userId: recipientId,
          lastReadAt: recipientReadAt,
        });
      } else {
        // 상대방이 채팅방 밖에 있으면 유저 개인 룸으로 알림 전송
        this.server.to(`user:${recipientId}`).emit('newMessageNotification', {
          chatRoomId: payload.chatRoomId,
          message,
        });
      }

      // 발신자 읽음 알림
      this.server.to(payload.chatRoomId).emit('messagesRead', {
        chatRoomId: payload.chatRoomId,
        userId: user.id,
        lastReadAt: senderReadAt,
      });
    } catch (error) {
      client.emit('error', {
        message: error.message || 'Failed to send message',
      });
    }
  }
}
