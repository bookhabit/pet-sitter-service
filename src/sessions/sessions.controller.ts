import { Controller, Post, Body } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) {}

    @Post()
    @Public()
    async login(@Body() loginDto: LoginDto) {
        return this.sessionsService.login(loginDto);
    }
}
