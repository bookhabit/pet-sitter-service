import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma, Job, JobApplication } from '@prisma/client';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}


  private toCreateInput(dto: CreateUserDto): Prisma.UserCreateInput {
    return {
      id: randomUUID(),
      email: dto.email,
      full_name: dto.full_name,
      password: dto.password,
      roles: dto.roles,
    };
  }
  

  async create(dto: CreateUserDto): Promise<User> {
    const existsUser = await this.prisma.user.findUnique({
      where: { email: dto.email }
    })
    if (existsUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }
    return this.prisma.user.create({ data: this.toCreateInput(dto) });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 이메일 변경 시 중복 체크
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new ConflictException('이미 존재하는 이메일입니다.');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.email && { email: dto.email }),
        ...(dto.full_name && { full_name: dto.full_name }),
        ...(dto.password && { password: dto.password }),
        ...(dto.roles && { roles: dto.roles }),
      },
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findJobsByUserId(id: string): Promise<{ items: Job[] }> {
    // 사용자 존재 확인
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const jobs = await this.prisma.job.findMany({
      where: { creator_user_id: id },
      include: {
        pets: true,
      },
    });

    return { items: jobs };
  }

  async findJobApplicationsByUserId(id: string): Promise<{ items: JobApplication[] }> {
    // 사용자 존재 확인
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const jobApplications = await this.prisma.jobApplication.findMany({
      where: { user_id: id },
      include: {
        user: true,
        job: {
          include: {
            pets: true,
          },
        },
      },
    });

    return { items: jobApplications };
  }
}
