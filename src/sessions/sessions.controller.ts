import { Controller, Post, Body } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { LoginDto } from './dto/login.dto';

@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) {}

    @Post()
    async login(@Body() loginDto: LoginDto) {
        return this.sessionsService.login(loginDto);
    }
}
