import { IQuery } from '@nestjs/cqrs';

/**
 * 사용자 정보 조회 쿼리 (Query)
 */
export class GetUserInfoQuery implements IQuery {
  constructor(public readonly userId: string) {}
}

