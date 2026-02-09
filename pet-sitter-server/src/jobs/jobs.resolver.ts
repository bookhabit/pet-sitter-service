import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ForbiddenException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobModel } from './models/job.model';
import { PaginatedJobs } from './models/paginated-jobs.model';
import { CreateJobInput } from './inputs/create-job.input';
import { UpdateJobInput } from './inputs/update-job.input';
import { JobFilterInput } from './inputs/job-filter.input';
import { PaginationInput } from './inputs/pagination.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

@Resolver(() => JobModel)
export class JobsResolver {
  constructor(private readonly jobsService: JobsService) {}

  @Mutation(() => JobModel, { description: '구인공고 등록 (PetOwner만 가능)' })
  @Roles(Role.PetOwner)
  async createJob(
    @Args('data') data: CreateJobInput,
    @CurrentUser() user: User,
  ) {
    return this.jobsService.create(data, user.id);
  }

  @Query(() => JobModel, { description: '구인공고 상세 조회' })
  async job(@Args('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Query(() => PaginatedJobs, { description: '구인공고 목록 조회 (필터링 + 페이지네이션)' })
  async jobs(
    @Args('filter', { nullable: true }) filter?: JobFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedJobs> {
    // GraphQL Input을 REST DTO 형식으로 변환
    const queryParams: any = {
      limit: pagination?.limit || 20,
      cursor: pagination?.cursor,
    };

    if (filter?.startTimeAfter) queryParams.start_time_after = filter.startTimeAfter;
    if (filter?.startTimeBefore) queryParams.start_time_before = filter.startTimeBefore;
    if (filter?.endTimeAfter) queryParams.end_time_after = filter.endTimeAfter;
    if (filter?.endTimeBefore) queryParams.end_time_before = filter.endTimeBefore;
    if (filter?.activity) queryParams.activity = filter.activity;

    // pets 필터를 bracket notation으로 변환
    if (filter?.pets?.species) {
      queryParams['pets[species]'] = filter.pets.species.join(',');
    }
    if (filter?.pets?.ageAbove !== undefined) {
      queryParams['pets[age_above]'] = filter.pets.ageAbove;
    }
    if (filter?.pets?.ageBelow !== undefined) {
      queryParams['pets[age_below]'] = filter.pets.ageBelow;
    }

    const result = await this.jobsService.findAll(queryParams);

    return {
      items: result.items,
      pageInfo: {
        hasNextPage: !!result.cursor,
        endCursor: result.cursor || undefined,
      },
    };
  }

  @Mutation(() => JobModel, { description: '구인공고 수정 (본인 또는 Admin만 가능)' })
  async updateJob(
    @Args('id') id: string,
    @Args('data') data: UpdateJobInput,
    @CurrentUser() user: User,
  ) {
    // Service에서 권한 체크 수행
    return this.jobsService.update(id, data, user.id);
  }

  @Mutation(() => Boolean, { description: '구인공고 삭제 (본인 또는 Admin만 가능)' })
  async deleteJob(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    // Service에서 권한 체크 수행
    await this.jobsService.remove(id, user.id);
    return true;
  }
}
