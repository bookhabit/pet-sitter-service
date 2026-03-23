import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMessagesQueryDto {
  @ApiPropertyOptional({ description: '조회할 메시지 수', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: '커서 (메시지 UUID)', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  cursor?: string;
}
