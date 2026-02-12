// dto/search-jobs.query.dto.ts
import { Type, Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  Max,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchJobsQueryDto {
  @ApiPropertyOptional({ example: '2026-03-01T00:00:00Z', description: '이 날짜 이전에 시작하는 공고' })
  @IsOptional()
  @IsDateString()
  start_time_before?: string;

  @ApiPropertyOptional({ example: '2026-02-01T00:00:00Z', description: '이 날짜 이후에 시작하는 공고' })
  @IsOptional()
  @IsDateString()
  start_time_after?: string;

  @ApiPropertyOptional({ example: '2026-03-31T00:00:00Z', description: '이 날짜 이전에 종료하는 공고' })
  @IsOptional()
  @IsDateString()
  end_time_before?: string;

  @ApiPropertyOptional({ example: '2026-02-01T00:00:00Z', description: '이 날짜 이후에 종료하는 공고' })
  @IsOptional()
  @IsDateString()
  end_time_after?: string;

  @ApiPropertyOptional({ example: '산책', description: '공고 내용 키워드 검색' })
  @IsOptional()
  @IsString()
  activity?: string;

  @ApiPropertyOptional({ example: 3, minimum: 1, description: '이 나이 이하의 반려동물 공고 (pets[age_below])' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pets[age_below] must be an integer' })
  @Min(1, { message: 'pets[age_below] must be at least 1 (pet age cannot be less than 1)' })
  'pets[age_below]'?: number;

  @ApiPropertyOptional({ example: 1, minimum: 1, description: '이 나이 이상의 반려동물 공고 (pets[age_above])' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pets[age_above] must be an integer' })
  @Min(1, { message: 'pets[age_above] must be at least 1 (pet age cannot be less than 1)' })
  'pets[age_above]'?: number;

  @ApiPropertyOptional({ example: 'Dog', description: '종류 필터. 여러 개는 쉼표 구분 (예: Cat,Dog) (pets[species])' })
  @IsOptional()
  @IsString({ message: 'pets[species] must be a string' })
  @Transform(({ value }) => {
    if (!value || value === 'string' || value.trim() === '') {
      return undefined;
    }
    return value;
  })
  'pets[species]'?: string;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100, default: 20, description: '페이지당 항목 수' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: '다음 페이지 커서 (응답의 cursor 값)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ example: 'start_time:asc', description: '정렬 기준 (예: start_time:asc, end_time:desc)' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ example: 10000, minimum: 0, description: '최소 가격 필터 (이상)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({ example: 50000, minimum: 0, description: '최대 가격 필터 (이하)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  max_price?: number;
}
