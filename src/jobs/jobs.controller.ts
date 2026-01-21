import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job-dto';
import { UpdateJobDto } from './dto/update-job-dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) {}

    // 구인공고 등록
    @Post()
    create(@Body() createJobDto: CreateJobDto, @CurrentUser() user: User) {
        return this.jobsService.create(createJobDto, user.id);
    }

    // 구인공고 목록 조회
    @Get()
    findAll() {
        return this.jobsService.findAll();
    }

    // 구인공고 상세 조회
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.jobsService.findOne(id);
    }

    // 구인공고 수정
    @Put(':id')
    update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
        return this.jobsService.update(id, updateJobDto);
    }

    // 구인공고 삭제
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.jobsService.remove(id);
    }
}
