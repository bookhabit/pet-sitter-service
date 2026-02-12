import { IsUUID } from 'class-validator';

export class ToggleFavoriteDto {
  @IsUUID('4')
  job_id: string;
}
