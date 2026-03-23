import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class PhotoModel {
  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field(() => ID)
  id: string;

  @ApiProperty({ example: 'https://cdn.example.com/photo.jpg' })
  @Field()
  url: string;

  @ApiProperty({ example: 'abc123.jpg' })
  @Field()
  file_name: string;

  @ApiProperty({ example: 'my-photo.jpg' })
  @Field()
  original_name: string;

  @ApiProperty({ example: 'image/jpeg' })
  @Field()
  mime_type: string;

  @ApiProperty({ example: 204800 })
  @Field(() => Int)
  size: number;

  @ApiProperty({ example: 'uuid', format: 'uuid' })
  @Field()
  uploader_id: string;

  @ApiProperty({ example: 'uuid', format: 'uuid', nullable: true })
  @Field(() => String, { nullable: true })
  user_id: string | null;

  @ApiProperty({ example: 'uuid', format: 'uuid', nullable: true })
  @Field(() => String, { nullable: true })
  job_id: string | null;

  @ApiProperty({ example: 'uuid', format: 'uuid', nullable: true })
  @Field(() => String, { nullable: true })
  pet_id: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Field()
  createdAt: Date;
}
