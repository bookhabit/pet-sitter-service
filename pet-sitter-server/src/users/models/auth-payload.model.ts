import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthPayload {
  @Field()
  user_id: string;

  @Field()
  auth_header: string;
}
