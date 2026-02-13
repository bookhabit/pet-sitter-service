import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { JobApplicationModel } from '../../job-application/models/job-application.model';
import { MessageModel } from './message.model';

@ObjectType()
export class ChatRoomModel {
  @Field(() => ID)
  id: string;

  @Field()
  job_application_id: string;

  @Field(() => JobApplicationModel, { nullable: true })
  jobApplication?: JobApplicationModel;

  @Field(() => [MessageModel], { nullable: true })
  messages?: MessageModel[];

  @Field(() => Int, { description: '안읽은 메시지 수' })
  unreadCount: number;

  @Field()
  createdAt: Date;
}
