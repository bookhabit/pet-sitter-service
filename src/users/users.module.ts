import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailModule } from 'src/email/email.module';
import { UserEntity } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CreateUserHandler } from './handlers/create-user.handler';
import { UserCreatedHandler } from './handlers/user-created.handler';
import { GetUserInfoHandler } from './handlers/get-user-info.handler';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    CreateUserHandler,
    UserCreatedHandler,
    GetUserInfoHandler,
  ],
  imports: [
    CqrsModule, // CQRS 모듈 추가
    EmailModule,
    TypeOrmModule.forFeature([UserEntity]),
    AuthModule, // AuthService를 사용하기 위해 import
  ],
})
export class UsersModule {}
