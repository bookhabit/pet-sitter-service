import { Controller, Post, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';

import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SessionsService } from './sessions.service';
import { LoginDto } from './dto/login.dto';
import { RefreshSessionDto } from './dto/refresh-session.dto';
import { AuthPayload } from '../users/models/auth-payload.model';

class RefreshPayload {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  newRefreshToken: string;
}

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: '로그인 — accessToken(15m) + refreshToken(7d) 발급' })
  @ApiResponse({ status: 200, description: '로그인 성공', type: AuthPayload })
  @ApiResponse({ status: 401, description: '이메일 또는 비밀번호 불일치' })
  async login(@Body() loginDto: LoginDto) {
    return this.sessionsService.login(loginDto);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: '토큰 갱신 — refreshToken으로 새 accessToken + refreshToken 발급' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공', type: RefreshPayload })
  @ApiResponse({ status: 401, description: '유효하지 않은 refresh token' })
  async refresh(@Body() refreshDto: RefreshSessionDto) {
    return this.sessionsService.refresh(refreshDto.refreshToken);
  }

  @Delete()
  @ApiOperation({ summary: '로그아웃 — 세션 삭제' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(@CurrentUser() user: { id: string }) {
    await this.sessionsService.logout(user.id);
    return { message: 'Logged out successfully' };
  }
}
