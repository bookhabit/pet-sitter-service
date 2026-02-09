import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { SessionsService } from '../sessions/sessions.service';
import { UserModel } from './models/user.model';
import { AuthPayload } from './models/auth-payload.model';
import { RegisterInput } from './inputs/register.input';
import { LoginInput } from './inputs/login.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { JobModel } from '../jobs/models/job.model';
import { JobApplicationModel } from '../job-application/models/job-application.model';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Mutation(() => UserModel, { description: '회원가입' })
  @Public()
  async register(@Args('data') data: RegisterInput): Promise<User> {
    return this.usersService.create(data);
  }

  @Mutation(() => AuthPayload, { description: '로그인' })
  @Public()
  async login(@Args('data') data: LoginInput): Promise<{ user_id: string; auth_header: string }> {
    return this.sessionsService.login(data);
  }

  @Mutation(() => UserModel, { description: '사용자 정보 수정' })
  async updateUser(
    @Args('id') id: string,
    @Args('data') data: UpdateUserInput,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    // 본인 또는 Admin만 수정 가능
    if (currentUser.id !== id && !currentUser.roles.includes(Role.Admin)) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.update(id, data);
  }

  @Mutation(() => Boolean, { description: '사용자 삭제' })
  async deleteUser(
    @Args('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    // 본인 또는 Admin만 삭제 가능
    if (currentUser.id !== id && !currentUser.roles.includes(Role.Admin)) {
      throw new ForbiddenException('You can only delete your own account');
    }
    await this.usersService.remove(id);
    return true;
  }

  @Query(() => UserModel, { description: '현재 로그인한 사용자 조회' })
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Query(() => UserModel, { description: '특정 사용자 조회' })
  async user(@Args('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Query(() => [JobModel], { description: '사용자가 등록한 구인공고 목록' })
  async userJobs(@Args('userId') userId: string) {
    const result = await this.usersService.findJobsByUserId(userId);
    return result.items;
  }

  @Query(() => [JobApplicationModel], { description: '사용자가 지원한 구인공고 목록' })
  async userJobApplications(@Args('userId') userId: string) {
    const result = await this.usersService.findJobApplicationsByUserId(userId);
    return result.items;
  }
}
