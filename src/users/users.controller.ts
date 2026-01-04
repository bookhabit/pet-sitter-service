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
  ParseIntPipe,
  DefaultValuePipe,
  ValidationPipe,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { VerifyEmailDto } from './dto/verify-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserInfo } from './UserInfo';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/guard';
import { CreateUserCommand } from './commands/create-user.command';
import { GetUserInfoQuery } from './queries/get-user-info.query';

@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    // password를 문자열로 변환 (Postman에서 숫자로 보낸 경우 대비)
    const passwordString = String(password);

    // CQRS 패턴: CommandBus를 통해 명령 전달
    await this.commandBus.execute(
      new CreateUserCommand(name, email, passwordString),
    );

    return {
      message: '회원 가입이 완료되었습니다.',
      email: email,
    };
  }

  @Post('/email-verify')
  async verifyEmail(@Query() dto: VerifyEmailDto): Promise<string> {
    return this.usersService.verifyEmail(dto);
  }

  @Post('/login')
  async login(@Body() dto: LoginDto): Promise<string> {
    const { email, password } = dto;
    return this.usersService.login(email, password);
  }

  @Get()
  findAll(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    console.log(offset, limit);
    return 'findAll';
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getUserInfo(@Param('id') userId: string): Promise<UserInfo> {
    // CQRS 패턴: QueryBus를 통해 쿼리 전달
    return this.queryBus.execute(new GetUserInfoQuery(userId));
  }
}
