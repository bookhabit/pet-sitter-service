import { Module } from '@nestjs/common';
import { JobApplicationController } from './job-application.controller';
import { JobApplicationByJobController } from './job-application.controller';
import { JobApplicationService } from './job-application.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JobApplicationByJobController, JobApplicationController],
  providers: [JobApplicationService],
})
export class JobApplicationModule {}
