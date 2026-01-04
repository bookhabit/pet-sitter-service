import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;

    const now = Date.now();
    this.logger.log(
      `➡️  요청: ${method} ${url}`,
      body ? JSON.stringify(body) : '',
    );

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - now;
        this.logger.log(
          `⬅️  응답: ${method} ${url} (${responseTime}ms)`,
          data ? JSON.stringify(data).substring(0, 100) : '',
        );
      }),
    );
  }
}
