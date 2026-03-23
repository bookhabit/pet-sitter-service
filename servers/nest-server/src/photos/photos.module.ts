import { Module } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { PhotosController } from './photos.controller';
import { PhotosResolver } from './photos.resolver';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [PhotosController],
  providers: [PhotosService, PhotosResolver],
  exports: [PhotosService],
})
export class PhotosModule {}
