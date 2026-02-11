import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('jobs/:jobId/reviews')
  create(
    @Param('jobId') jobId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.create(jobId, dto, user.id);
  }

  @Get('users/:userId/reviews')
  findByUser(
    @Param('userId') userId: string,
    @Query('sort') sort?: string,
  ) {
    return this.reviewsService.findByReviewee(userId, sort);
  }

  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.remove(id, user.id);
  }
}
