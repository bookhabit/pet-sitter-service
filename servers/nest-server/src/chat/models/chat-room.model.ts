import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { JobApplicationModel } from '../../job-application/models/job-application.model';
import { MessageModel } from './message.model';

@ObjectType()
export class ChatRoomModel {
  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field(() => ID)
  id: string;

  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field()
  job_application_id: string;

  @ApiProperty({ type: () => JobApplicationModel, nullable: true })
  @Field(() => JobApplicationModel, { nullable: true })
  jobApplication?: JobApplicationModel;

  @ApiProperty({ type: [MessageModel], nullable: true })
  @Field(() => [MessageModel], { nullable: true })
  messages?: MessageModel[];

  @ApiProperty({ example: 3, description: '안읽은 메시지 수' })
  @Field(() => Int, { description: '안읽은 메시지 수' })
  unreadCount: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Field()
  createdAt: Date;
}
