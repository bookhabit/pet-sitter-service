import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user-dto';
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
    return this.prisma.user.create({
      data: this.toCreateInput(dto),
    });
  }
  
}
