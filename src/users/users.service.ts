import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}


  private toCreateInput(dto: CreateUserDto): Prisma.UserCreateInput {
    return {
      id: uuid(),
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

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
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
}
