import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class Base64FileInput {
  @Field({ description: 'Base64 인코딩된 파일 데이터' })
  @IsString()
  @IsNotEmpty()
  base64: string;

  @Field({ description: '원본 파일명 (확장자 포함)' })
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @Field({ description: 'MIME type (image/jpeg | image/png | image/webp)' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;
}
