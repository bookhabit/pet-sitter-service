import { ApproveStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateJobApplicationDto {
  @IsOptional()
  @IsEnum(ApproveStatus)
  status?: ApproveStatus;
}
