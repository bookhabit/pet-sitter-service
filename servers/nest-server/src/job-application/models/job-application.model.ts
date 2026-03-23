import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { ApproveStatus } from '@prisma/client';
import { UserModel } from '../../users/models/user.model';
import { JobModel } from '../../jobs/models/job.model';

// Enum 등록 (GraphQL 스키마에 노출)
registerEnumType(ApproveStatus, {
  name: 'ApproveStatus',
  description: 'Job application status (applying, approved, rejected)',
});

@ObjectType()
export class JobApplicationModel {
  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field(() => ID)
  id: string;

  @ApiProperty({ enum: ApproveStatus, example: ApproveStatus.applying })
  @Field(() => ApproveStatus)
  status: ApproveStatus;

  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field()
  user_id: string;

  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field()
  job_id: string;

  @ApiProperty({ type: () => UserModel, nullable: true })
  @Field(() => UserModel, { nullable: true })
  user?: UserModel;

  @ApiProperty({ type: () => JobModel, nullable: true })
  @Field(() => JobModel, { nullable: true })
  job?: JobModel;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Field()
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Field()
  updatedAt: Date;
}
