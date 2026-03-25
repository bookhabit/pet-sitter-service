import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const { method, url, body, ip } = req;
    const start = Date.now();

    this.logger.log(`→ ${method} ${url} [${ip}] ${JSON.stringify(body)}`);

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(`← ${method} ${url} ${ms}ms`);
      }),
    );
  }
}
