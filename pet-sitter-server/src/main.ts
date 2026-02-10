import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 업로드 파일 정적 서빙
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  
  // 전역 ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성이 있으면 에러
      transform: true, // 자동 타입 변환
      transformOptions: {
        enableImplicitConversion: true, // 암시적 타입 변환 활성화
      },
    }),
  );

  // openapi.yml 파일 로드
  let swaggerDocument: any;
  try {
    const openApiFile = readFileSync(join(process.cwd(), 'openapi.yml'), 'utf8');
    swaggerDocument = parse(openApiFile);
  } catch (error) {
    console.warn('openapi.yml 파일을 로드할 수 없습니다. 기본 Swagger 설정을 사용합니다.');
    // openapi.yml이 없으면 기본 설정 사용
    const config = new DocumentBuilder()
      .setTitle('PetSitter API')
      .setDescription('PetSitter API 문서')
      .setVersion('0.1')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme',
        },
        'SessionToken', // 🔑 security name
      )
      .build();
    swaggerDocument = SwaggerModule.createDocument(app, config);
  }

  // openapi.yml을 기본으로 사용하고, 코드에서 생성된 스키마만 보완
  const codeDocument = SwaggerModule.createDocument(app, new DocumentBuilder().build());
  
  // openapi.yml의 paths를 완전히 우선 사용
  // openapi.yml에 정의된 경로는 그대로 사용하고, 없는 경로만 codeDocument에서 추가
  if (swaggerDocument.paths) {
    // openapi.yml의 paths를 기본으로 사용
    const mergedPaths = { ...swaggerDocument.paths };
    // codeDocument의 paths 중 openapi.yml에 없는 경로만 추가
    if (codeDocument.paths) {
      Object.keys(codeDocument.paths).forEach(path => {
        if (!mergedPaths[path]) {
          mergedPaths[path] = codeDocument.paths[path];
        }
      });
    }
    swaggerDocument.paths = mergedPaths;
  } else {
    swaggerDocument.paths = codeDocument.paths;
  }

  // components 병합: openapi.yml 우선, 코드에서 생성된 스키마는 보완
  if (swaggerDocument.components) {
    swaggerDocument.components = {
      ...swaggerDocument.components,
      ...codeDocument.components,
      schemas: {
        ...swaggerDocument.components.schemas,
        ...codeDocument.components?.schemas,
      },
    };
  } else {
    swaggerDocument.components = codeDocument.components;
  }

  // security (root) 병합
  if (swaggerDocument.security) {
    swaggerDocument.security = swaggerDocument.security;
  } else if (codeDocument.security) {
    swaggerDocument.security = codeDocument.security;
  }

  // info 병합 (openapi.yml 우선)
  if (!swaggerDocument.info && codeDocument.info) {
    swaggerDocument.info = codeDocument.info;
  }

  SwaggerModule.setup('api', app, swaggerDocument);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api`);
}
bootstrap();
