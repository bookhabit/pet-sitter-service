import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SessionsService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async login(dto: LoginDto): Promise<{ user_id: string; auth_header: string }> {
        // 사용자 조회
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // 비밀번호 확인
        if (user.password !== dto.password) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'default-secret-key',
            { expiresIn: '7d' },
        );

        const authHeader = `Bearer ${token}`;

        // 세션 저장
        await this.prisma.session.create({
            data: {
                id: uuid(),
                user_id: user.id,
                auth_header: authHeader,
            },
        });

        return {
            user_id: user.id,
            auth_header: authHeader,
        };
    }
}
