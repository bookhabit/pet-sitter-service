import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 채팅방 입장: 접근 검증 + ChatRoom lazy creation (upsert) + 읽음처리
   */
  async joinRoom(jobApplicationId: string, userId: string) {
    const jobApplication = await this.prisma.jobApplication.findUnique({
      where: { id: jobApplicationId },
      include: { job: true },
    });

    if (!jobApplication) {
      throw new NotFoundException('JobApplication not found');
    }

    this.validateChatParticipant(jobApplication, userId);

    // Lazy Creation — race condition 방지를 위한 upsert
    const chatRoom = await this.prisma.chatRoom.upsert({
      where: { job_application_id: jobApplicationId },
      create: { id: randomUUID(), job_application_id: jobApplicationId },
      update: {},
    });

    return chatRoom;
  }

  /**
   * 메시지 전송: 접근 검증 + 메시지 DB 저장
   */
  async sendMessage(chatRoomId: string, content: string, senderId: string) {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: { jobApplication: { include: { job: true } } },
    });

    if (!chatRoom) {
      throw new NotFoundException('ChatRoom not found');
    }

    this.validateChatParticipant(chatRoom.jobApplication, senderId);

    const message = await this.prisma.message.create({
      data: {
        id: randomUUID(),
        content,
        sender_id: senderId,
        chat_room_id: chatRoomId,
      },
      include: { sender: true },
    });

    return message;
  }

  /**
   * 읽음처리: ChatRoomRead upsert (last_read_at = now)
   */
  async markAsRead(chatRoomId: string, userId: string) {
    const now = new Date();

    await this.prisma.chatRoomRead.upsert({
      where: {
        chat_room_id_user_id: {
          chat_room_id: chatRoomId,
          user_id: userId,
        },
      },
      create: {
        id: randomUUID(),
        chat_room_id: chatRoomId,
        user_id: userId,
        last_read_at: now,
      },
      update: {
        last_read_at: now,
      },
    });

    return now;
  }

  /**
   * 내 채팅방 목록: 최근 메시지 1개 + 안읽은 수 포함
   */
  async findMyChatRooms(userId: string) {
    // 내가 참여한 JobApplication 기반으로 채팅방 조회
    const chatRooms = await this.prisma.chatRoom.findMany({
      where: {
        jobApplication: {
          OR: [
            { user_id: userId },
            { job: { creator_user_id: userId } },
          ],
        },
      },
      include: {
        jobApplication: {
          include: {
            user: true,
            job: { include: { creator: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: true },
        },
        readReceipts: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 각 채팅방의 안읽은 메시지 수 계산
    const result = await Promise.all(
      chatRooms.map(async (chatRoom) => {
        const myReadReceipt = chatRoom.readReceipts.find(
          (r) => r.user_id === userId,
        );
        const lastReadAt = myReadReceipt?.last_read_at ?? new Date(0);

        const unreadCount = await this.prisma.message.count({
          where: {
            chat_room_id: chatRoom.id,
            createdAt: { gt: lastReadAt },
            sender_id: { not: userId },
          },
        });

        return {
          ...chatRoom,
          unreadCount,
        };
      }),
    );

    return result;
  }

  /**
   * 커서 기반 메시지 페이지네이션
   */
  async findMessages(
    chatRoomId: string,
    userId: string,
    limit: number = 20,
    cursor?: string,
  ) {
    // 접근 검증
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: { jobApplication: { include: { job: true } } },
    });

    if (!chatRoom) {
      throw new NotFoundException('ChatRoom not found');
    }

    this.validateChatParticipant(chatRoom.jobApplication, userId);

    const safeLimit = Math.min(limit, 100);

    const messages = await this.prisma.message.findMany({
      where: { chat_room_id: chatRoomId },
      orderBy: { createdAt: 'desc' },
      take: safeLimit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      include: { sender: true },
    });

    const hasMore = messages.length > safeLimit;
    const result = hasMore ? messages.slice(0, safeLimit) : messages;
    const nextCursor = hasMore ? result[result.length - 1].id : null;

    return {
      messages: result,
      nextCursor,
    };
  }

  /**
   * 채팅방의 상대방 userId 반환
   */
  async getRecipientId(chatRoomId: string, senderId: string): Promise<string> {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: { jobApplication: { include: { job: true } } },
    });

    if (!chatRoom) {
      throw new NotFoundException('ChatRoom not found');
    }

    const { jobApplication } = chatRoom;
    if (jobApplication.user_id === senderId) {
      return jobApplication.job.creator_user_id;
    }
    return jobApplication.user_id;
  }

  /**
   * 접근 제어: PetOwner(공고 등록자) 또는 PetSitter(지원자)만 허용
   */
  private validateChatParticipant(
    jobApplication: { user_id: string; job: { creator_user_id: string } },
    userId: string,
  ): void {
    const isApplicant = jobApplication.user_id === userId;
    const isJobCreator = jobApplication.job.creator_user_id === userId;

    if (!isApplicant && !isJobCreator) {
      throw new ForbiddenException('이 채팅방에 접근할 권한이 없습니다');
    }
  }
}
