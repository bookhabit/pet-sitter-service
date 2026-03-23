import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshSessionDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '기존 JWT (Bearer 접두사 없이 raw token 값)',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
