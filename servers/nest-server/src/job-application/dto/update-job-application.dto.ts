import { ApproveStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateJobApplicationDto {
  @ApiProperty({ enum: ApproveStatus, example: ApproveStatus.approved, description: '지원 상태 (applying / approved / rejected)' })
  @IsNotEmpty({ message: 'status is required' })
  @IsEnum(ApproveStatus, { message: 'status must be one of: applying, approved, rejected' })
  status: ApproveStatus;
}
