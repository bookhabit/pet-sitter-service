import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Public 데코레이터가 있는 경우 인증 건너뛰기
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // 토큰 검증 스킵
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    // "Bearer <token>" 형식에서 토큰 추출
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      // JWT 토큰 검증
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret-key',
      ) as { userId: string; email: string };

      // 사용자 조회
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // 세션이 존재하는지 확인 (선택사항)
      const session = await this.prisma.session.findFirst({
        where: {
          user_id: user.id,
          auth_header: authHeader,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      if (!session) {
        throw new UnauthorizedException('Session not found');
      }

      // 요청 객체에 사용자 정보 추가
      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }
      throw error;
    }
  }
}
