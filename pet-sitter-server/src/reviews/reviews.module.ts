import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsResolver } from './reviews.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ReviewsService, ReviewsResolver],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
