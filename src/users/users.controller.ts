import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Redirect,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { VerifyEmailDto } from './dto/verify-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
  }

  @Post('/email-verify')
  async verifyEmail(@Query() dto: VerifyEmailDto): Promise<string> {
    console.log(dto);
    return Promise.resolve(
      `This action verifies email ${dto.signupVerifyToken}`,
    );
  }

  @Post('/login')
  async login(@Body() dto: LoginDto): Promise<string> {
    console.log(dto);
    return Promise.resolve(`This action logs in user ${dto.email}`);
  }

  @Get(':id')
  async getUserInfo(@Param('id') id: string): Promise<string> {
    console.log(id);
    return Promise.resolve(`This action returns a #${id} user`);
  }
}
