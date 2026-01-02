import { Module } from '@nestjs/common';
import { join } from 'path';

import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import emailConfig from './config/emailConfig';
import { validationSchema } from './config/validationSchema';

// 환경 파일 경로 설정
const nodeEnv = process.env.NODE_ENV || 'development';
const envFileName = `.${nodeEnv}.env`;

// 프로젝트 루트 기준 경로 (개발/프로덕션 모두 동작)
const envFilePath = join(process.cwd(), 'src', 'config', 'env', envFileName);

console.log('🔍 환경 파일 경로:', envFilePath);
console.log('🔍 NODE_ENV:', nodeEnv);

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envFilePath],
      load: [emailConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
