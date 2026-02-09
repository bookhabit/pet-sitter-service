import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 20, description: '페이지 크기 (기본: 20, 최대: 100)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @Field({ nullable: true, description: 'Cursor 기반 페이지네이션 커서' })
  @IsOptional()
  @IsString()
  cursor?: string;
}
