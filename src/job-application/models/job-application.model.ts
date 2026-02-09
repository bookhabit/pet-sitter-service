import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
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
  @Field(() => ID)
  id: string;

  @Field(() => ApproveStatus)
  status: ApproveStatus;

  @Field()
  user_id: string;

  @Field()
  job_id: string;

  @Field(() => UserModel, { nullable: true })
  user?: UserModel;

  @Field(() => JobModel, { nullable: true })
  job?: JobModel;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
