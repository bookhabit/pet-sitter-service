import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// 환경변수 미설정 시 서버 시작 단계에서 즉시 실패
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set in environment variables`);
  return value;
}

const ACCESS_SECRET = requireEnv('JWT_ACCESS_SECRET');

interface AccessTokenPayload {
  userId: string;
  email: string;
  type: 'access';
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = this.getRequest(context);
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    // accessToken 검증
    let decoded: AccessTokenPayload;
    try {
      decoded = jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Access token expired');
      }
      throw new UnauthorizedException('Invalid access token');
    }

    if (decoded.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // 사용자 + 세션 단일 쿼리로 조회 (DB 2회 → 1회)
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { sessions: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // sessions: Session[] — user_id가 unique이므로 0 또는 1개
    if (user.sessions.length === 0) {
      throw new UnauthorizedException('Session not found — please log in again');
    }

    // request.user에는 sessions 제외한 순수 user만 전달
    const { sessions: _, ...userWithoutSessions } = user;
    request.user = userWithoutSessions;
    return true;
  }

  private getRequest(context: ExecutionContext) {
    const contextType = context.getType<string>();

    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      return gqlContext.getContext().req;
    }

    return context.switchToHttp().getRequest();
  }
}
