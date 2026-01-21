import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { JobApplicationService } from './job-application.service';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { User } from '@prisma/client';

@Controller('jobs/:jobId/job-applications')
export class JobApplicationByJobController {
    constructor(private readonly jobApplicationService: JobApplicationService) {}

    @Post()
    @Roles('SITTER')
    create(
        @Param('jobId') jobId: string,
        @CurrentUser() currentUser: User,
    ) {
        // currentUser.id는 지원자 ID (applicantUserId)
        return this.jobApplicationService.create(jobId, currentUser.id);
    }

    @Get()
    findAllByJob(@Param('jobId') jobId: string) {
        return this.jobApplicationService.findAllByJobId(jobId);
    }
}

@Controller('job-applications')
export class JobApplicationController {
    constructor(private readonly jobApplicationService: JobApplicationService) {}

    @Put(':jobApplicationId')
    update(
        @Param('jobApplicationId') jobApplicationId: string,
        @Body() updateJobApplicationDto: UpdateJobApplicationDto,
    ) {
        return this.jobApplicationService.update(jobApplicationId, updateJobApplicationDto);
    }
}
