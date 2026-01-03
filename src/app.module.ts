import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import emailConfig from './config/emailConfig';
import databaseConfig from './config/databaseConfig';
import { validationSchema } from './config/validationSchema';
import { UserEntity } from './users/entities/user.entity';
import { LoggerMiddleware, LoggerMiddleware2 } from './logger.middleware';

// 환경 파일 경로 설정
const nodeEnv = process.env.NODE_ENV || 'development';
const envFileName = `.${nodeEnv}.env`;

// 프로젝트 루트 기준 경로 (개발/프로덕션 모두 동작)
const envFilePath = join(process.cwd(), 'src', 'config', 'env', envFileName);

console.log('🔍 환경 파일 경로:', envFilePath);
console.log('🔍 NODE_ENV:', nodeEnv);

@Module({
  imports: [
    // ConfigModule을 먼저 로드하여 환경 변수를 사용할 수 있도록 함
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envFilePath],
      load: [emailConfig, databaseConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    // TypeOrmModule은 ConfigModule 이후에 로드하고 ConfigService를 사용
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          type: dbConfig.type,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [UserEntity],
          synchronize: dbConfig.synchronize,
        };
      },
    }),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, LoggerMiddleware2)
      // .exclude({ path: '/users', method: RequestMethod.POST })
      .forRoutes('/users');
  }
}
