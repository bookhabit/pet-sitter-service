import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ToggleFavoriteResult {
  @Field()
  added: boolean;
}
