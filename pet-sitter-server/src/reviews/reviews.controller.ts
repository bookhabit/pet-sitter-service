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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Reviews')
@ApiBearerAuth('access-token')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('jobs/:jobId/reviews')
  @ApiOperation({ summary: '리뷰 작성 (공고 등록자만 가능)' })
  @ApiParam({ name: 'jobId', description: '공고 UUID' })
  @ApiResponse({ status: 201, description: '리뷰 작성 완료' })
  @ApiResponse({ status: 400, description: '승인된 지원자 없음' })
  @ApiResponse({ status: 403, description: '공고 등록자 아님' })
  @ApiResponse({ status: 409, description: '이미 리뷰 작성됨' })
  create(
    @Param('jobId') jobId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.create(jobId, dto, user.id);
  }

  @Get('users/:userId/reviews')
  @ApiOperation({ summary: '펫시터 리뷰 목록 조회' })
  @ApiParam({ name: 'userId', description: '펫시터 UUID' })
  @ApiQuery({ name: 'sort', required: false, description: 'createdAt:desc | rating:desc', example: 'rating:desc' })
  @ApiResponse({ status: 200, description: 'OK' })
  findByUser(
    @Param('userId') userId: string,
    @Query('sort') sort?: string,
  ) {
    return this.reviewsService.findByReviewee(userId, sort);
  }

  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '리뷰 삭제 (작성자만 가능)' })
  @ApiParam({ name: 'id', description: '리뷰 UUID' })
  @ApiResponse({ status: 204, description: '삭제 완료' })
  @ApiResponse({ status: 403, description: '삭제 권한 없음' })
  @ApiResponse({ status: 404, description: '리뷰를 찾을 수 없음' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.remove(id, user.id);
  }
}
