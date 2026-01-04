import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserInfoQuery } from '../queries/get-user-info.query';
import { UsersService } from '../users.service';
import { UserInfo } from '../UserInfo';

/**
 * 사용자 정보 조회 쿼리 핸들러 (Query Handler)
 */
@QueryHandler(GetUserInfoQuery)
export class GetUserInfoHandler implements IQueryHandler<GetUserInfoQuery> {
  constructor(private readonly usersService: UsersService) {}

  async execute(query: GetUserInfoQuery): Promise<UserInfo> {
    const { userId } = query;
    return this.usersService.getUserInfo(userId);
  }
}

