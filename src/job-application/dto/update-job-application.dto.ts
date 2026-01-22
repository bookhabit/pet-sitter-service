import { ApproveStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateJobApplicationDto {
  @IsNotEmpty({ message: 'status is required' })
  @IsEnum(ApproveStatus, { message: 'status must be one of: applying, approved, rejected' })
  status: ApproveStatus;
}
