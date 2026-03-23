import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Review } from '@prisma/client';
import { randomUUID } from 'crypto';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(jobId: string, dto: CreateReviewDto, reviewerId: string): Promise<Review> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { jobApplications: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const approvedApplication = job.jobApplications.find(
      (app) => app.status === 'approved',
    );

    if (!approvedApplication) {
      throw new BadRequestException('승인된 지원자가 없어 리뷰를 작성할 수 없습니다.');
    }

    let revieweeId: string;
    const isPetOwner = job.creator_user_id === reviewerId;
    const isPetSitter = approvedApplication.user_id === reviewerId;

    if (isPetOwner) {
      revieweeId = approvedApplication.user_id;
    } else if (isPetSitter) {
      revieweeId = job.creator_user_id;
    } else {
      throw new ForbiddenException('해당 공고에 대한 리뷰 작성 권한이 없습니다.');
    }

    const existingReview = await this.prisma.review.findUnique({
      where: { job_id_reviewer_id: { job_id: jobId, reviewer_id: reviewerId } },
    });

    if (existingReview) {
      throw new ConflictException('이미 해당 공고에 리뷰를 작성했습니다.');
    }

    return this.prisma.review.create({
      data: {
        id: randomUUID(),
        rating: dto.rating,
        comment: dto.comment,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        job_id: jobId,
      },
    });
  }

  async findByReviewee(userId: string, sort?: string): Promise<Review[]> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort === 'rating:desc') orderBy = { rating: 'desc' };
    else if (sort === 'rating:asc') orderBy = { rating: 'asc' };
    else if (sort === 'createdAt:asc') orderBy = { createdAt: 'asc' };

    return this.prisma.review.findMany({
      where: { reviewee_id: userId },
      orderBy,
    });
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    const review = await this.prisma.review.findUnique({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.reviewer_id !== currentUserId) {
      throw new ForbiddenException('리뷰 작성자만 삭제할 수 있습니다.');
    }

    await this.prisma.review.delete({ where: { id } });
  }
}
