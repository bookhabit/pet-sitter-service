import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    console.log(req.method, req.url);
    next();
  }
}

@Injectable()
export class LoggerMiddleware2 implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request2...');
    console.log(req.method, req.url);
    next();
  }
}

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log('middleware Logger...');
  console.log(req.method, req.url);
  next();
}
