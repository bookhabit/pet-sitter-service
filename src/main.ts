import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { logger } from './logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'verbose', 'debug'],
  });

  // 전역 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(logger);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
