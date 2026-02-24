import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class AuthPayload {
  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field()
  user_id: string;

  @ApiProperty({ example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Field()
  auth_header: string;
}
