import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PhotosService } from '../photos/photos.service';
import { CreateJobDto } from './dto/create-job-dto';
import { UpdateJobDto } from './dto/update-job-dto';
import { Job, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { SearchJobsQueryDto } from './dto/search-job-query.dto';

// Job with Pets included
type JobWithPets = Prisma.JobGetPayload<{
    include: { pets: true }
}>;

@Injectable()
export class JobsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly photosService: PhotosService,
    ) {}

    async create(createJobDto: CreateJobDto, creatorUserId: string): Promise<Job> {
        // 날짜 유효성 검사
        const startTime = new Date(createJobDto.start_time);
        const endTime = new Date(createJobDto.end_time);

        if (isNaN(startTime.getTime())) {
            throw new BadRequestException('start_time must be a valid date-time');
        }

        if (isNaN(endTime.getTime())) {
            throw new BadRequestException('end_time must be a valid date-time');
        }

        if (startTime >= endTime) {
            throw new BadRequestException('start_time must be before end_time');
        }

        // 각 pet에 할당할 id를 미리 생성 (사진 연결에 사용)
        const petsWithId = createJobDto.pets.map(pet => ({
            id: randomUUID(),
            ...pet,
        }));

        // Job 생성
        const job = await this.prisma.job.create({
            data: {
                id: randomUUID(),
                creator_user_id: creatorUserId,
                start_time: startTime,
                end_time: endTime,
                activity: createJobDto.activity,
                pets: {
                    create: petsWithId.map(pet => ({
                        id: pet.id,
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
            },
        });

        // 사전 업로드된 사진 연결
        if (createJobDto.photo_ids?.length) {
            await this.photosService.attachToJob(createJobDto.photo_ids, job.id);
        }

        // 펫별 사진 연결
        for (let i = 0; i < petsWithId.length; i++) {
            const petPhotoIds = createJobDto.pets[i].photo_ids;
            if (petPhotoIds?.length) {
                await this.photosService.attachToPet(petPhotoIds, petsWithId[i].id);
            }
        }

        return job;
    }

    async findAll(query: SearchJobsQueryDto): Promise<{ items: JobWithPets[]; cursor: string | null }> {
        console.log('🔍 [JobsService.findAll] 요청된 쿼리 파라미터:', JSON.stringify(query, null, 2));
        
        // Where 조건 구성
        const where: Prisma.JobWhereInput = {};

        // 날짜 필터링
        if (query.start_time_before || query.start_time_after) {
            where.start_time = {};
            if (query.start_time_before) {
                where.start_time.lte = new Date(query.start_time_before);
                console.log('📅 [필터] start_time <=', query.start_time_before);
            }
            if (query.start_time_after) {
                where.start_time.gte = new Date(query.start_time_after);
                console.log('📅 [필터] start_time >=', query.start_time_after);
            }
        }

        if (query.end_time_before || query.end_time_after) {
            where.end_time = {};
            if (query.end_time_before) {
                where.end_time.lte = new Date(query.end_time_before);
                console.log('📅 [필터] end_time <=', query.end_time_before);
            }
            if (query.end_time_after) {
                where.end_time.gte = new Date(query.end_time_after);
                console.log('📅 [필터] end_time >=', query.end_time_after);
            }
        }

        // activity full-text search
        if (query.activity) {
            where.activity = {
                contains: query.activity,
                mode: 'insensitive', // 대소문자 구분 없이 검색
            };
            console.log('🔎 [필터] activity contains:', query.activity);
        }

        // pets 필터링 (쿼리 파라미터의 bracket notation 처리)
        const petsAgeBelow = (query as any)['pets[age_below]'];
        const petsAgeAbove = (query as any)['pets[age_above]'];
        const petsSpecies = (query as any)['pets[species]'];

        if (petsAgeBelow !== undefined || petsAgeAbove !== undefined || petsSpecies) {
            const petsWhere: Prisma.PetWhereInput = {};

            // age 필터링 (age_below와 age_above 모두 지원)
            if (petsAgeBelow !== undefined || petsAgeAbove !== undefined) {
                petsWhere.age = {};
                if (petsAgeBelow !== undefined) {
                    petsWhere.age.lte = petsAgeBelow;
                    console.log('🐾 [필터] pet age <=', petsAgeBelow);
                }
                if (petsAgeAbove !== undefined) {
                    petsWhere.age.gte = petsAgeAbove;
                    console.log('🐾 [필터] pet age >=', petsAgeAbove);
                }
            }

            if (petsSpecies) {
                // 쉼표로 구분된 여러 species 지원
                // 한 번의 순회로 split, normalize, validate 동시 처리 (O(n))
                const speciesList: string[] = [];
                const invalidSpecies: string[] = [];
                
                const parts = petsSpecies.split(',');
                for (let i = 0; i < parts.length; i++) {
                    const trimmed = parts[i].trim();
                    if (!trimmed) continue; // 빈 문자열 스킵
                    
                    // 대소문자 구분 없이 처리하고 첫 글자만 대문자로 변환
                    const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
                    
                    // 유효한 enum 값만 추가 (Cat 또는 Dog)
                    if (normalized === 'Cat' || normalized === 'Dog') {
                        speciesList.push(normalized);
                    } else {
                        invalidSpecies.push(trimmed);
                    }
                }

                if (speciesList.length === 0) {
                    const errorMsg = invalidSpecies.length > 0
                        ? `Invalid species value(s): ${invalidSpecies.join(', ')}. Expected "Cat" or "Dog" (case-insensitive).`
                        : `Invalid species value. Expected "Cat" or "Dog" (case-insensitive), but received: ${petsSpecies}`;
                    throw new BadRequestException(errorMsg);
                }

                petsWhere.species = {
                    in: speciesList as any, // PetSpecies enum 타입
                };
                console.log('🐾 [필터] pet species in:', speciesList);
            }

            // pets 필터가 있으면 해당 조건을 만족하는 pet을 가진 job만 조회
            if (Object.keys(petsWhere).length > 0) {
                where.pets = {
                    some: petsWhere,
                };
            }
        }

        // Sort 처리
        const orderBy: Prisma.JobOrderByWithRelationInput[] = [];
        if (query.sort) {
            const [field, direction] = query.sort.split(':');
            if (field === 'start_time' || field === 'end_time') {
                const sortDirection = direction === 'desc' ? 'desc' : 'asc';
                orderBy.push({
                    [field]: sortDirection,
                });
                console.log('📊 [정렬]', field, sortDirection);
            }
        }
        // 기본 정렬: start_time asc
        if (orderBy.length === 0) {
            orderBy.push({ start_time: 'asc' });
            console.log('📊 [정렬] 기본값: start_time asc');
        }

        // Limit 처리 (기본값 20, 최대 100)
        const limit = Math.min(query.limit || 20, 100);
        const take = limit + 1; // cursor 확인을 위해 1개 더 가져옴
        console.log('📄 [페이징] limit:', limit, 'take:', take);

        // Cursor 기반 pagination
        const cursor = query.cursor
            ? {
                  id: query.cursor,
              }
            : undefined;
        if (cursor) {
            console.log('📄 [페이징] cursor:', query.cursor);
        } else {
            console.log('📄 [페이징] 첫 페이지');
        }

        console.log('🔧 [Prisma Query] where 조건:', JSON.stringify(where, null, 2));
        console.log('🔧 [Prisma Query] orderBy:', JSON.stringify(orderBy, null, 2));

        // 쿼리 실행
        const startTime = Date.now();
        const jobs = await this.prisma.job.findMany({
            where,
            include: {
                pets: true,
                // creator: true,
            },
            orderBy,
            take,
            cursor,
        });
        const queryTime = Date.now() - startTime;

        console.log('⏱️ [쿼리 실행 시간]', queryTime, 'ms');
        console.log('📦 [조회 결과] 총', jobs.length, '개 조회됨');

        // 다음 페이지가 있는지 확인
        const hasNextPage = jobs.length > limit;
        const items = hasNextPage ? jobs.slice(0, limit) : jobs;
        const nextCursor = hasNextPage ? items[items.length - 1].id : null;

        console.log('✅ [최종 결과]');
        console.log('  - 반환할 items:', items.length, '개');
        console.log('  - 다음 페이지 존재:', hasNextPage);
        console.log('  - nextCursor:', nextCursor || 'null');

        return {
            items,
            cursor: nextCursor,
        };
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

    async update(id: string, updateJobDto: UpdateJobDto, currentUserId: string): Promise<Job> {
        const job = await this.prisma.job.findUnique({
            where: { id },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        // 권한 체크: 본인만 수정 가능
        if (job.creator_user_id !== currentUserId) {
            throw new ForbiddenException('You can only update your own jobs');
        }

        const updateData: Prisma.JobUpdateInput = {};

        // 날짜 유효성 검사
        let startTime: Date | undefined;
        let endTime: Date | undefined;

        if (updateJobDto.start_time) {
            startTime = new Date(updateJobDto.start_time);
            if (isNaN(startTime.getTime())) {
                throw new BadRequestException('start_time must be a valid date-time');
            }
            updateData.start_time = startTime;
        }

        if (updateJobDto.end_time) {
            endTime = new Date(updateJobDto.end_time);
            if (isNaN(endTime.getTime())) {
                throw new BadRequestException('end_time must be a valid date-time');
            }
            updateData.end_time = endTime;
        }

        // start_time과 end_time 모두 업데이트되는 경우 유효성 검사
        if (startTime && endTime) {
            if (startTime >= endTime) {
                throw new BadRequestException('start_time must be before end_time');
            }
        } else if (startTime && job.end_time) {
            // start_time만 업데이트되는 경우
            if (startTime >= job.end_time) {
                throw new BadRequestException('start_time must be before end_time');
            }
        } else if (endTime && job.start_time) {
            // end_time만 업데이트되는 경우
            if (job.start_time >= endTime) {
                throw new BadRequestException('start_time must be before end_time');
            }
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

    async remove(id: string, currentUserId: string): Promise<void> {
        const job = await this.prisma.job.findUnique({
            where: { id },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        // 권한 체크: 본인만 삭제 가능
        if (job.creator_user_id !== currentUserId) {
            throw new ForbiddenException('You can only delete your own jobs');
        }

        await this.prisma.job.delete({
            where: { id },
        });
    }
}
