import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

// Enum 등록 (GraphQL 스키마에 노출)
registerEnumType(Role, {
  name: 'Role',
  description: 'User roles',
});

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  full_name: string;

  @Field(() => [Role])
  roles: Role[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // password는 노출하지 않음
}
