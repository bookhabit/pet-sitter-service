import {
  Controller,
  Post,
  Delete,
  Param,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { FileValidationPipe, FilesValidationPipe } from '../common/pipes/file-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller()
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  /**
   * [신규] 다중 파일 업로드 (entity 미연결)
   * 클라이언트 흐름:
   *   1. POST /photos/upload → Photo[] (photo IDs 획득)
   *   2. POST /jobs  (body에 photo_ids + pets[x].photo_ids 포함)
   */
  @Post('photos/upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadMany(
    @UploadedFiles(new FilesValidationPipe()) files: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    return this.photosService.uploadMany(files, user.id);
  }

  // ─── 기존 단건 업로드 (하위 호환) ──────────────────────────────

  @Post('users/:id/photos')
  @UseInterceptors(FileInterceptor('file'))
  uploadUserPhoto(
    @Param('id') userId: string,
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.photosService.uploadForUser(file, userId, user.id);
  }

  @Post('jobs/:id/photos')
  @UseInterceptors(FileInterceptor('file'))
  uploadJobPhoto(
    @Param('id') jobId: string,
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.photosService.uploadForJob(file, jobId, user.id);
  }

  @Post('pets/:id/photos')
  @UseInterceptors(FileInterceptor('file'))
  uploadPetPhoto(
    @Param('id') petId: string,
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.photosService.uploadForPet(file, petId, user.id);
  }

  @Delete('photos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePhoto(@Param('id') id: string, @CurrentUser() user: User) {
    return this.photosService.deletePhoto(id, user.id);
  }
}
