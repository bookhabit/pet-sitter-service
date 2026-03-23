import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PhotoModel } from '../../photos/models/photo.model';

// Enum 등록 (GraphQL 스키마에 노출)
registerEnumType(Role, {
  name: 'Role',
  description: 'User roles',
});

@ObjectType()
export class UserModel {
  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field(() => ID)
  id: string;

  @ApiProperty({ example: 'owner1@test.com' })
  @Field()
  email: string;

  @ApiProperty({ example: '김주인' })
  @Field()
  full_name: string;

  @ApiProperty({ enum: Role, isArray: true, example: [Role.PetOwner] })
  @Field(() => [Role])
  roles: Role[];

  @ApiProperty({ type: [PhotoModel], description: '프로필 사진 목록' })
  @Field(() => [PhotoModel], { description: '프로필 사진 목록' })
  photos: PhotoModel[];

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Field()
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Field()
  updatedAt: Date;

  // password는 노출하지 않음
}
