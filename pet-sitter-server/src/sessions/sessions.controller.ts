import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) {}

    @Post()
    @Public()
    @ApiOperation({ summary: '로그인 (인증 불필요) — 반환된 auth_header를 Authorize 버튼에 입력' })
    @ApiResponse({ status: 200, description: '로그인 성공 — user_id와 auth_header 반환' })
    @ApiResponse({ status: 401, description: '이메일 또는 비밀번호 불일치' })
    async login(@Body() loginDto: LoginDto) {
        return this.sessionsService.login(loginDto);
    }
}
