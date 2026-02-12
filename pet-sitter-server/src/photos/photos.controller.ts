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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { FileValidationPipe, FilesValidationPipe } from '../common/pipes/file-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Photos')
@ApiBearerAuth('access-token')
@Controller()
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('photos/upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: '다중 파일 업로드 (entity 미연결) — photo_ids 획득 후 공고 등록 시 사용' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' }, maxItems: 10 },
      },
    },
  })
  @ApiResponse({ status: 201, description: '업로드 완료 — Photo 배열 반환' })
  uploadMany(
    @UploadedFiles(new FilesValidationPipe()) files: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    return this.photosService.uploadMany(files, user.id);
  }

  @Post('users/:id/photos')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '사용자 프로필 사진 업로드' })
  @ApiParam({ name: 'id', description: '사용자 UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 201, description: '업로드 완료' })
  uploadUserPhoto(
    @Param('id') userId: string,
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.photosService.uploadForUser(file, userId, user.id);
  }

  @Post('jobs/:id/photos')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '공고 사진 업로드' })
  @ApiParam({ name: 'id', description: '공고 UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 201, description: '업로드 완료' })
  uploadJobPhoto(
    @Param('id') jobId: string,
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.photosService.uploadForJob(file, jobId, user.id);
  }

  @Post('pets/:id/photos')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '반려동물 사진 업로드' })
  @ApiParam({ name: 'id', description: '반려동물 UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 201, description: '업로드 완료' })
  uploadPetPhoto(
    @Param('id') petId: string,
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.photosService.uploadForPet(file, petId, user.id);
  }

  @Delete('photos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '사진 삭제 (업로더만 가능)' })
  @ApiParam({ name: 'id', description: '사진 UUID' })
  @ApiResponse({ status: 204, description: '삭제 완료' })
  @ApiResponse({ status: 403, description: '삭제 권한 없음' })
  @ApiResponse({ status: 404, description: '사진을 찾을 수 없음' })
  deletePhoto(@Param('id') id: string, @CurrentUser() user: User) {
    return this.photosService.deletePhoto(id, user.id);
  }
}
