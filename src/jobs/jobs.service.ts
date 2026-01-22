import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job-dto';
import { UpdateJobDto } from './dto/update-job-dto';
import { Job, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class JobsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createJobDto: CreateJobDto, creatorUserId: string): Promise<Job> {
        // Dog를 먼저 생성
        const dog = await this.prisma.dog.create({
            data: {
                id: randomUUID(),
                name: createJobDto.dog.name,
                age: createJobDto.dog.age,
                breed: createJobDto.dog.breed,
                size: createJobDto.dog.size,
            },
        });

        // Job 생성 시 dog_id 연결
        return this.prisma.job.create({
            data: {
                id: randomUUID(),
                creator_user_id: creatorUserId,
                start_time: new Date(createJobDto.start_time),
                end_time: new Date(createJobDto.end_time),
                activity: createJobDto.activity,
                dog_id: dog.id,
            },
            include: {
                dog: true,
                // creator: true,
            },
        });
    }

    async findAll(): Promise<Job[]> {
        return this.prisma.job.findMany({
            include: {
                dog: true,
                // creator: true,
            },
        });
    }

    async findOne(id: string): Promise<Job | null> {
        const job = await this.prisma.job.findUnique({
            where: { id },
            include: {
                dog: true,
                creator: true,
            },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        return job;
    }

    async update(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
        const job = await this.prisma.job.findUnique({
            where: { id },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        const updateData: Prisma.JobUpdateInput = {};

        if (updateJobDto.start_time) {
            updateData.start_time = new Date(updateJobDto.start_time);
        }
        if (updateJobDto.end_time) {
            updateData.end_time = new Date(updateJobDto.end_time);
        }
        if (updateJobDto.activity) {
            updateData.activity = updateJobDto.activity;
        }
        if (updateJobDto.dog) {
            updateData.dog = {
                update: {
                    name: updateJobDto.dog.name,
                    age: updateJobDto.dog.age,
                    breed: updateJobDto.dog.breed,
                    size: updateJobDto.dog.size,
                },
            };
        }

        return this.prisma.job.update({
            where: { id },
            data: updateData,
            include: {
                dog: true,
                // creator: true,
            },
        });
    }

    async remove(id: string): Promise<void> {
        const job = await this.prisma.job.findUnique({
            where: { id },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        await this.prisma.job.delete({
            where: { id },
        });
    }
}
