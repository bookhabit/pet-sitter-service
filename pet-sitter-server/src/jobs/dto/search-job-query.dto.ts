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

export class SearchJobsQueryDto {
  @IsOptional()
  @IsDateString()
  start_time_before?: string;

  @IsOptional()
  @IsDateString()
  start_time_after?: string;

  @IsOptional()
  @IsDateString()
  end_time_before?: string;

  @IsOptional()
  @IsDateString()
  end_time_after?: string;

  @IsOptional()
  @IsString()
  activity?: string;

  // pets 필터를 평면 구조로 변경 (쿼리 파라미터에서 bracket notation 지원)
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pets[age_below] must be an integer' })
  @Min(1, { message: 'pets[age_below] must be at least 1 (pet age cannot be less than 1)' })
  'pets[age_below]'?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pets[age_above] must be an integer' })
  @Min(1, { message: 'pets[age_above] must be at least 1 (pet age cannot be less than 1)' })
  'pets[age_above]'?: number;

  @IsOptional()
  @IsString({ message: 'pets[species] must be a string' })
  @Transform(({ value }) => {
    // 빈 문자열이나 "string" 같은 기본값 제거
    if (!value || value === 'string' || value.trim() === '') {
      return undefined;
    }
    return value;
  })
  'pets[species]'?: string; // 쉼표로 구분된 여러 species (예: "Cat,Dog")

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsString()
  sort?: string;
}
