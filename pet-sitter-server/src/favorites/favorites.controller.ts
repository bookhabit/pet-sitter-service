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
import { FavoritesService } from './favorites.service';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

@Controller()
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Post('favorites')
    @Roles(Role.PetSitter)
    toggle(@Body() dto: ToggleFavoriteDto, @CurrentUser() user: User) {
        return this.favoritesService.toggle(user.id, dto.job_id);
    }

    @Get('favorites')
    @Roles(Role.PetSitter)
    findAll(@CurrentUser() user: User) {
        return this.favoritesService.findByUser(user.id);
    }

    @Delete('favorites/:jobId')
    @Roles(Role.PetSitter)
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('jobId') jobId: string, @CurrentUser() user: User) {
        return this.favoritesService.remove(user.id, jobId);
    }
}
