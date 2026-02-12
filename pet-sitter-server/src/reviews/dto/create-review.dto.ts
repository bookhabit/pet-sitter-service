import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5, description: '별점 (1~5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: '매우 친절하고 꼼꼼하게 돌봐주셨어요!', description: '리뷰 텍스트 (선택)' })
  @IsOptional()
  @IsString()
  comment?: string;
}
