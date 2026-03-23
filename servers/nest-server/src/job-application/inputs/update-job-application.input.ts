import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApproveStatus } from '@prisma/client';

@InputType()
export class UpdateJobApplicationInput {
  @Field(() => ApproveStatus)
  @IsNotEmpty({ message: 'status is required' })
  @IsEnum(ApproveStatus, { message: 'status must be one of: applying, approved, rejected' })
  status: ApproveStatus;
}
