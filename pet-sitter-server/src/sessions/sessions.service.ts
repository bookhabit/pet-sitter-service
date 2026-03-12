import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

// 환경변수 미설정 시 서버 시작 단계에서 즉시 실패
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set in environment variables`);
  return value;
}

const ACCESS_SECRET = requireEnv('JWT_ACCESS_SECRET');
const REFRESH_SECRET = requireEnv('JWT_REFRESH_SECRET');

interface AccessTokenPayload {
  userId: string;
  email: string;
  type: 'access';
}

interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
}

export interface LoginResult {
  user_id: string;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResult {
  accessToken: string;
  newRefreshToken: string;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // 사용자 미존재 시에도 bcrypt 비교 수행 → 타이밍 공격 방지
    const dummyHash = '$2b$12$invalidhashfortimingnormalization000000000000000000000';
    const passwordValid = user
      ? await bcrypt.compare(dto.password, user.password)
      : await bcrypt.compare(dto.password, dummyHash).then(() => false);

    if (!user || !passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 액세스 토큰 (15분)
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'access',
      } satisfies AccessTokenPayload,
      ACCESS_SECRET,
      { expiresIn: '15m' },
    );

    // 리프레시 토큰 (7일)
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' } satisfies RefreshTokenPayload,
      REFRESH_SECRET,
      { expiresIn: '7d' },
    );

    // 1인 1세션: upsert로 기존 세션을 교체
    await this.prisma.session.upsert({
      where: { user_id: user.id },
      update: { refresh_token_hash: hashToken(refreshToken) },
      create: {
        id: randomUUID(),
        user_id: user.id,
        refresh_token_hash: hashToken(refreshToken),
      },
    });

    return { user_id: user.id, accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<RefreshResult> {
    // 1. JWT 서명 및 만료 검증
    let payload: RefreshTokenPayload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET) as RefreshTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // 2. DB 세션 조회 + hash 비교
    const session = await this.prisma.session.findUnique({
      where: { user_id: payload.userId },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException(
        'Session not found — please log in again',
      );
    }

    if (session.refresh_token_hash !== hashToken(refreshToken)) {
      // 토큰 재사용 감지: 세션 삭제 (보안)
      await this.prisma.session.delete({ where: { user_id: payload.userId } });
      throw new UnauthorizedException(
        'Refresh token reuse detected — session revoked',
      );
    }

    // 3. 새 토큰 발급
    const newAccessToken = jwt.sign(
      {
        userId: session.user_id,
        email: session.user.email,
        type: 'access',
      } satisfies AccessTokenPayload,
      ACCESS_SECRET,
      { expiresIn: '15m' },
    );

    const newRefreshToken = jwt.sign(
      {
        userId: session.user_id,
        type: 'refresh',
      } satisfies RefreshTokenPayload,
      REFRESH_SECRET,
      { expiresIn: '7d' },
    );

    // 4. refresh token rotation: 새 hash로 업데이트
    await this.prisma.session.update({
      where: { user_id: session.user_id },
      data: { refresh_token_hash: hashToken(newRefreshToken) },
    });

    return { accessToken: newAccessToken, newRefreshToken };
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { user_id: userId } });
  }
}
