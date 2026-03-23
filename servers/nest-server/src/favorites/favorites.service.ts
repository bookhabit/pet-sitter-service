import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

// Job 조회에서 공통으로 사용하는 include
const JOB_INCLUDE = {
    pets: { include: { photos: true } },
    photos: true,
} as const;

type JobWithPhotos = Prisma.JobGetPayload<{ include: typeof JOB_INCLUDE }>;

@Injectable()
export class FavoritesService {
    constructor(private readonly prisma: PrismaService) {}

    async toggle(userId: string, jobId: string): Promise<{ added: boolean }> {
        const job = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
            throw new NotFoundException('Job not found');
        }

        const existing = await this.prisma.favorite.findUnique({
            where: { user_id_job_id: { user_id: userId, job_id: jobId } },
        });

        if (existing) {
            await this.prisma.favorite.delete({ where: { id: existing.id } });
            return { added: false };
        }

        await this.prisma.favorite.create({
            data: {
                id: randomUUID(),
                user_id: userId,
                job_id: jobId,
            },
        });
        return { added: true };
    }

    async findByUser(userId: string): Promise<JobWithPhotos[]> {
        const favorites = await this.prisma.favorite.findMany({
            where: { user_id: userId },
            include: {
                job: { include: JOB_INCLUDE },
            },
            orderBy: { createdAt: 'desc' },
        });

        return favorites.map(f => f.job);
    }

    async remove(userId: string, jobId: string): Promise<void> {
        const existing = await this.prisma.favorite.findUnique({
            where: { user_id_job_id: { user_id: userId, job_id: jobId } },
        });

        if (!existing) {
            throw new NotFoundException('Favorite not found');
        }

        await this.prisma.favorite.delete({ where: { id: existing.id } });
    }
}
