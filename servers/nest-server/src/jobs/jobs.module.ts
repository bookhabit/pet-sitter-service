import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [PhotosModule],
  controllers: [JobsController],
  providers: [JobsService, JobsResolver],
})
export class JobsModule {}
