import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleFavoriteDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', format: 'uuid', description: '즐겨찾기에 추가/제거할 공고 ID' })
  @IsUUID('4')
  job_id: string;
}
