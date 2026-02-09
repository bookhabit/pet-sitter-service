import { ObjectType, Field } from '@nestjs/graphql';
import { JobModel } from './job.model';

@ObjectType()
export class PageInfo {
  @Field({ description: '다음 페이지 존재 여부' })
  hasNextPage: boolean;

  @Field({ nullable: true, description: '다음 페이지 커서' })
  endCursor?: string;
}

@ObjectType()
export class PaginatedJobs {
  @Field(() => [JobModel], { description: '구인공고 목록' })
  items: JobModel[];

  @Field(() => PageInfo, { description: '페이지 정보' })
  pageInfo: PageInfo;
}
