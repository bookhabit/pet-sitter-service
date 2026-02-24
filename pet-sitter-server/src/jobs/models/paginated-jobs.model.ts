import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { JobModel } from './job.model';

@ObjectType()
export class PageInfo {
  @ApiProperty({ example: true, description: '다음 페이지 존재 여부' })
  @Field({ description: '다음 페이지 존재 여부' })
  hasNextPage: boolean;

  @ApiProperty({ example: 'cursor-string', nullable: true, description: '다음 페이지 커서' })
  @Field({ nullable: true, description: '다음 페이지 커서' })
  endCursor?: string;
}

@ObjectType()
export class PaginatedJobs {
  @ApiProperty({ type: [JobModel], description: '구인공고 목록' })
  @Field(() => [JobModel], { description: '구인공고 목록' })
  items: JobModel[];

  @ApiProperty({ type: PageInfo, description: '페이지 정보' })
  @Field(() => PageInfo, { description: '페이지 정보' })
  pageInfo: PageInfo;
}
