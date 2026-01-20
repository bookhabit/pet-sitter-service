import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 전역 ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성이 있으면 에러
      transform: true, // 자동 타입 변환
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
      .build();
    swaggerDocument = SwaggerModule.createDocument(app, config);
  }

  // 코드에서 생성된 Swagger 문서와 병합
  const codeDocument = SwaggerModule.createDocument(app, new DocumentBuilder().build());
  
  // 병합: openapi.yml 우선, 코드에서 생성된 내용은 보완
  if (swaggerDocument.components?.schemas) {
    codeDocument.components = codeDocument.components || {};
    codeDocument.components.schemas = {
      ...codeDocument.components.schemas,
      ...swaggerDocument.components.schemas,
    };
  }
  
  if (swaggerDocument.paths) {
    codeDocument.paths = {
      ...codeDocument.paths,
      ...swaggerDocument.paths,
    };
  }

  SwaggerModule.setup('api', app, codeDocument);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api`);
}
bootstrap();
