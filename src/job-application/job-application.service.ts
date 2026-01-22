import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

    async findAllByJobId(jobId: string): Promise<JobApplication[]> {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        return this.prisma.jobApplication.findMany({
            where: { job_id: jobId },
            include: {
                user: true,
                // job: {
                //     include: {
                //         dog: true,
                //     },
                // },
            },
        });
    }

    async update(
        jobApplicationId: string,
        updateJobApplicationDto: UpdateJobApplicationDto,
    ): Promise<JobApplication> {
        const jobApplication = await this.prisma.jobApplication.findUnique({
            where: { id: jobApplicationId },
        });

        if (!jobApplication) {
            throw new NotFoundException('JobApplication not found');
        }

        return this.prisma.jobApplication.update({
            where: { id: jobApplicationId },
            data: {
                ...(updateJobApplicationDto.status && {
                    status: updateJobApplicationDto.status,
                }),
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
