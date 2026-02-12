import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

@ApiTags('Favorites')
@ApiBearerAuth('access-token')
@Controller()
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Post('favorites')
    @Roles(Role.PetSitter)
    @ApiOperation({ summary: '즐겨찾기 토글 (PetSitter 전용) — 없으면 추가, 있으면 제거' })
    @ApiResponse({ status: 201, description: '{ added: true|false }' })
    @ApiResponse({ status: 403, description: 'PetSitter 권한 필요' })
    toggle(@Body() dto: ToggleFavoriteDto, @CurrentUser() user: User) {
        return this.favoritesService.toggle(user.id, dto.job_id);
    }

    @Get('favorites')
    @Roles(Role.PetSitter)
    @ApiOperation({ summary: '내 즐겨찾기 목록 조회 (PetSitter 전용)' })
    @ApiResponse({ status: 200, description: 'OK' })
    @ApiResponse({ status: 403, description: 'PetSitter 권한 필요' })
    findAll(@CurrentUser() user: User) {
        return this.favoritesService.findByUser(user.id);
    }

    @Delete('favorites/:jobId')
    @Roles(Role.PetSitter)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: '즐겨찾기 제거 (PetSitter 전용)' })
    @ApiParam({ name: 'jobId', description: '공고 UUID' })
    @ApiResponse({ status: 204, description: '제거 완료' })
    @ApiResponse({ status: 403, description: 'PetSitter 권한 필요' })
    remove(@Param('jobId') jobId: string, @CurrentUser() user: User) {
        return this.favoritesService.remove(user.id, jobId);
    }
}
