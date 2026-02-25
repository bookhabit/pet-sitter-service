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

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'access-secret-key';

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

    // 사용자 조회
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 세션 존재 여부 확인 (로그아웃 여부 체크)
    const session = await this.prisma.session.findUnique({
      where: { user_id: user.id },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found — please log in again');
    }

    request.user = user;
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
