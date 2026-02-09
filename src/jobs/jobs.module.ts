import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';

@Module({
  controllers: [JobsController],
  providers: [JobsService, JobsResolver],
})
export class JobsModule {}
