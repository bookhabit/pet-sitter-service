import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JobApplication } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class JobApplicationService {
    constructor(private readonly prisma: PrismaService) {}

    async create(
        jobId: string,
        applicantUserId: string,
    ): Promise<JobApplication> {
        // Job이 존재하는지 확인
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        // 구인공고 등록자 ID와 지원자 ID 구분
        const jobCreatorId = job.creator_user_id;

        // 구인공고 등록자는 자신의 구인공고에 지원할 수 없음
        if (jobCreatorId === applicantUserId) {
            throw new ConflictException('Job creator cannot apply to their own job');
        }

        // 이미 지원한 경우 확인
        const existingApplication = await this.prisma.jobApplication.findFirst({
            where: {
                job_id: jobId,
                user_id: applicantUserId,
            },
        });

        if (existingApplication) {
            throw new ConflictException('Already applied to this job');
        }

        return this.prisma.jobApplication.create({
            data: {
                id: randomUUID(),
                status: 'applying',
                user_id: applicantUserId,
                job_id: jobId,
            },
        });
    }

    async findAllByJobId(jobId: string): Promise<{ items: JobApplication[] }> {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        const jobApplications = await this.prisma.jobApplication.findMany({
            where: { job_id: jobId },
            include: {
                user: true,
            },
        });

        return { items: jobApplications };
    }

    async update(
        jobApplicationId: string,
        updateJobApplicationDto: UpdateJobApplicationDto,
        currentUserId: string,
    ): Promise<JobApplication> {
        const jobApplication = await this.prisma.jobApplication.findUnique({
            where: { id: jobApplicationId },
            include: {
                job: true,
            },
        });

        if (!jobApplication) {
            throw new NotFoundException('JobApplication not found');
        }

        // 권한 체크: 구인공고 작성자만 상태 변경 가능
        if (jobApplication.job.creator_user_id !== currentUserId) {
            throw new ForbiddenException('Only the job creator can update application status');
        }

        // status가 제공되지 않았으면 에러
        if (!updateJobApplicationDto.status) {
            throw new BadRequestException('status is required');
        }

        return this.prisma.jobApplication.update({
            where: { id: jobApplicationId },
            data: {
                status: updateJobApplicationDto.status,
            },
            include: {
                user: true,
                job: {
                    include: {
                        pets: true,
                    },
                },
            },
        });
    }
}
