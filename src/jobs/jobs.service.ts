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
        // Job 생성
        const job = await this.prisma.job.create({
            data: {
                id: randomUUID(),
                creator_user_id: creatorUserId,
                start_time: new Date(createJobDto.start_time),
                end_time: new Date(createJobDto.end_time),
                activity: createJobDto.activity,
                pets: {
                    create: createJobDto.pets.map(pet => ({
                        id: randomUUID(),
                        name: pet.name,
                        age: pet.age,
                        species: pet.species,
                        breed: pet.breed,
                        size: pet.size,
                    })),
                },
            },
            include: {
                pets: true,
                // creator: true,
            },
        });

        return job;
    }

    async findAll(): Promise<Job[]> {
        return this.prisma.job.findMany({
            include: {
                pets: true,
                // creator: true,
            },
        });
    }

    async findOne(id: string): Promise<Job | null> {
        const job = await this.prisma.job.findUnique({
            where: { id },
            include: {
                pets: true,
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
        if (updateJobDto.pets) {
            // 기존 pets 삭제 후 새로 생성
            updateData.pets = {
                deleteMany: {},
                create: updateJobDto.pets.map(pet => ({
                    id: randomUUID(),
                    name: pet.name,
                    age: pet.age,
                    species: pet.species,
                    breed: pet.breed,
                    size: pet.size,
                })),
            };
        }

        return this.prisma.job.update({
            where: { id },
            data: updateData,
            include: {
                pets: true,
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
