import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job-dto';
import { UpdateJobDto } from './dto/update-job-dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { User } from '@prisma/client';
import { SearchJobsQueryDto } from './dto/search-job-query.dto';

@ApiTags('Jobs')
@ApiBearerAuth('access-token')
@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) {}

    @Post()
    @Roles('PetOwner')
    @ApiOperation({ summary: '구인공고 등록 (PetOwner 전용)' })
    @ApiResponse({ status: 201, description: 'Created' })
    @ApiResponse({ status: 400, description: '유효성 검증 실패' })
    @ApiResponse({ status: 403, description: 'PetOwner 권한 필요' })
    create(@Body() createJobDto: CreateJobDto, @CurrentUser() user: User) {
        return this.jobsService.create(createJobDto, user.id);
    }

    @Get()
    @ApiOperation({ summary: '구인공고 목록 조회 (필터/페이지네이션)' })
    @ApiResponse({ status: 200, description: 'items 배열 + cursor 반환' })
    findAll(@Query() query: SearchJobsQueryDto) {
        return this.jobsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: '구인공고 상세 조회' })
    @ApiParam({ name: 'id', description: '공고 UUID' })
    @ApiResponse({ status: 200, description: 'OK' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    findOne(@Param('id') id: string) {
        return this.jobsService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: '구인공고 수정 (작성자 또는 Admin)' })
    @ApiParam({ name: 'id', description: '공고 UUID' })
    @ApiResponse({ status: 200, description: 'OK' })
    @ApiResponse({ status: 403, description: '수정 권한 없음' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @CurrentUser() user: User) {
        return this.jobsService.update(id, updateJobDto, user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: '구인공고 삭제 (작성자 또는 Admin)' })
    @ApiParam({ name: 'id', description: '공고 UUID' })
    @ApiResponse({ status: 200, description: 'OK' })
    @ApiResponse({ status: 403, description: '삭제 권한 없음' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    remove(@Param('id') id: string, @CurrentUser() user: User) {
        return this.jobsService.remove(id, user.id);
    }
}
