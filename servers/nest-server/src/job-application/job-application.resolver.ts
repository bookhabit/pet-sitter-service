import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { JobApplicationService } from './job-application.service';
import { JobApplicationModel } from './models/job-application.model';
import { UpdateJobApplicationInput } from './inputs/update-job-application.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

@Resolver(() => JobApplicationModel)
export class JobApplicationResolver {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  @Mutation(() => JobApplicationModel, { description: '구인공고에 지원 (PetSitter만 가능)' })
  @Roles(Role.PetSitter)
  async applyToJob(
    @Args('jobId') jobId: string,
    @CurrentUser() user: User,
  ) {
    return this.jobApplicationService.create(jobId, user.id);
  }

  @Query(() => [JobApplicationModel], { description: '특정 구인공고의 지원 목록 조회' })
  async jobApplicationsByJob(@Args('jobId') jobId: string) {
    const result = await this.jobApplicationService.findAllByJobId(jobId);
    return result.items;
  }

  @Mutation(() => JobApplicationModel, { description: '지원 상태 변경 (구인공고 작성자만 가능)' })
  async updateJobApplicationStatus(
    @Args('id') id: string,
    @Args('data') data: UpdateJobApplicationInput,
    @CurrentUser() user: User,
  ) {
    return this.jobApplicationService.update(id, data, user.id);
  }
}
