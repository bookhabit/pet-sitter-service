import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ReviewsService } from './reviews.service';
import { ReviewModel } from './models/review.model';
import { CreateReviewInput } from './inputs/create-review.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Resolver(() => ReviewModel)
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Mutation(() => ReviewModel, { description: '리뷰 작성 (PetOwner 또는 PetSitter)' })
  createReview(
    @Args('jobId', { type: () => ID }) jobId: string,
    @Args('data') data: CreateReviewInput,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.create(jobId, data, user.id);
  }

  @Query(() => [ReviewModel], { description: '특정 사용자가 받은 리뷰 목록' })
  userReviews(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('sort', { type: () => String, nullable: true }) sort?: string,
  ) {
    return this.reviewsService.findByReviewee(userId, sort);
  }

  @Mutation(() => Boolean, { description: '리뷰 삭제 (작성자만)' })
  async deleteReview(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    await this.reviewsService.remove(id, user.id);
    return true;
  }
}
