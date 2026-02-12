import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { FavoritesResolver } from './favorites.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [FavoritesService, FavoritesResolver],
    controllers: [FavoritesController],
})
export class FavoritesModule {}
