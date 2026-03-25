import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // base64 이미지 업로드 허용을 위해 body 크기 제한 확장
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // CORS: React 개발 서버 허용
  app.enableCors({
    origin: [
      'http://localhost:5173', // Vite (React)
      'http://localhost:3000', // CRA (React)
      /^http:\/\/localhost:808[0-9]$/, // http://localhost:8080 ~ 8089 모두 허용
      /^http:\/\/10\.0\.2\.2:808[0-9]$/, // Android 에뮬레이터용 (필수!)
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // 로컬 Wi-Fi 실제 디바이스용
    ],
    credentials: true,
  });

  // 업로드 파일 정적 서빙
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // 전역 ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger (Code First) 설정
  // GraphQL과 동일하게 코드에 선언된 데코레이터(@ApiProperty, @ApiOperation 등)로 문서 자동 생성
  const config = new DocumentBuilder()
    .setTitle('PetSitter API')
    .setDescription('PetSitter REST API 문서 — Code First 자동 생성')
    .setVersion('0.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'JWT Authorization header. 로그인(POST /sessions) 후 auth_header 값을 입력하세요.',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 8000;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api`);
}
bootstrap();
