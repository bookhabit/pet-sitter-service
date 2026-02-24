import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class ToggleFavoriteResult {
  @ApiProperty({ example: true, description: '추가됐으면 true, 제거됐으면 false' })
  @Field()
  added: boolean;
}
