import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 모든 HTTP 예외를 잡아서 처리하는 필터
 * 요청 URL과 예외 발생 시각을 콘솔에 출력
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 예외 타입에 따라 상태 코드와 메시지 결정
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // 예외 발생 시각
    const timestamp = new Date().toISOString();

    // 요청 정보
    const url = request.url;
    const method = request.method;
    const ip = request.ip || request.connection.remoteAddress;

    // 콘솔에 출력
    console.log('='.repeat(80));
    console.log('🚨 예외 발생');
    console.log('='.repeat(80));
    console.log(`📅 발생 시각: ${timestamp}`);
    console.log(`🌐 요청 URL: ${method} ${url}`);
    console.log(`📍 IP 주소: ${ip}`);
    console.log(`📊 상태 코드: ${status}`);
    console.log(`💬 에러 메시지:`, message);

    // 예외 상세 정보 (개발 환경에서만)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📋 예외 상세:`, exception);
      if (exception instanceof Error) {
        console.log(`📚 스택 트레이스:`, exception.stack);
      }
    }
    console.log('='.repeat(80));

    // 클라이언트에게 응답
    const errorResponse = {
      statusCode: status,
      timestamp: timestamp,
      path: url,
      method: method,
      message:
        typeof message === 'string'
          ? message
          : (message as any).message || 'An error occurred',
    };

    response.status(status).json(errorResponse);
  }
}
