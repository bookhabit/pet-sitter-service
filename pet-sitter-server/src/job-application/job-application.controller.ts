import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JobApplicationService } from './job-application.service';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { User, JobApplication } from '@prisma/client';

@ApiTags('JobApplications')
@ApiBearerAuth('access-token')
@Controller('jobs/:jobId/job-applications')
export class JobApplicationByJobController {
    constructor(private readonly jobApplicationService: JobApplicationService) {}

    @Post()
    @Roles('PetSitter')
    @ApiOperation({ summary: '구인공고 지원 (PetSitter 전용)' })
    @ApiParam({ name: 'jobId', description: '공고 UUID' })
    @ApiResponse({ status: 201, description: '지원 완료' })
    @ApiResponse({ status: 403, description: 'PetSitter 권한 필요' })
    @ApiResponse({ status: 409, description: '이미 지원한 공고' })
    create(
        @Param('jobId') jobId: string,
        @CurrentUser() currentUser: User,
    ) {
        return this.jobApplicationService.create(jobId, currentUser.id);
    }

    @Get()
    @ApiOperation({ summary: '공고별 지원 목록 조회' })
    @ApiParam({ name: 'jobId', description: '공고 UUID' })
    @ApiResponse({ status: 200, description: 'OK' })
    findAllByJob(@Param('jobId') jobId: string): Promise<{ items: JobApplication[] }> {
        return this.jobApplicationService.findAllByJobId(jobId);
    }
}

@ApiTags('JobApplications')
@ApiBearerAuth('access-token')
@Controller('job-applications')
export class JobApplicationController {
    constructor(private readonly jobApplicationService: JobApplicationService) {}

    @Put(':jobApplicationId')
    @ApiOperation({ summary: '지원 상태 수정 (승인/거절) — 공고 작성자만 가능' })
    @ApiParam({ name: 'jobApplicationId', description: '지원서 UUID' })
    @ApiResponse({ status: 200, description: 'OK' })
    @ApiResponse({ status: 403, description: '수정 권한 없음' })
    @ApiResponse({ status: 404, description: '지원서를 찾을 수 없음' })
    update(
        @Param('jobApplicationId') jobApplicationId: string,
        @Body() updateJobApplicationDto: UpdateJobApplicationDto,
        @CurrentUser() currentUser: User,
    ) {
        return this.jobApplicationService.update(jobApplicationId, updateJobApplicationDto, currentUser.id);
    }
}
