import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { PhotosService } from './photos.service';
import { PhotoModel } from './models/photo.model';
import { Base64FileInput } from './inputs/base64-file.input';
import { FileValidationPipe, FilesValidationPipe } from '../common/pipes/file-validation.pipe';
import { base64ToMulterFile } from '../common/utils/file.utils';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Resolver(() => PhotoModel)
export class PhotosResolver {
  constructor(private readonly photosService: PhotosService) {}

  // ─── 다건 업로드 (신규) ────────────────────────────────────────

  /**
   * 다중 파일 업로드 (entity 미연결)
   * REST의 POST /photos/upload 와 동일한 흐름:
   *   1. uploadPhotos() → [PhotoModel] (photo IDs 획득)
   *   2. createJob() 등에서 photo_ids 포함해 entity 연결
   */
  @Mutation(() => [PhotoModel], { description: '다중 사진 업로드 (entity 미연결)' })
  async uploadPhotos(
    @Args('files', { type: () => [Base64FileInput] }) files: Base64FileInput[],
    @CurrentUser() user: User,
  ) {
    const multerFiles = files.map((f) =>
      base64ToMulterFile(f.base64, f.originalName, f.mimeType),
    );
    // GraphQL은 Pipe를 자동 적용할 수 없으므로 직접 검증 실행
    new FilesValidationPipe().transform(multerFiles);
    return this.photosService.uploadMany(multerFiles, user.id);
  }

  // ─── 단건 업로드 (하위 호환) ───────────────────────────────────

  @Mutation(() => PhotoModel, { description: '사용자 프로필 사진 업로드' })
  async uploadUserPhoto(
    @Args('userId') userId: string,
    @Args('file') fileInput: Base64FileInput,
    @CurrentUser() user: User,
  ) {
    const file = base64ToMulterFile(fileInput.base64, fileInput.originalName, fileInput.mimeType);
    new FileValidationPipe().transform(file);
    return this.photosService.uploadForUser(file, userId, user.id);
  }

  @Mutation(() => PhotoModel, { description: '공고 사진 업로드' })
  async uploadJobPhoto(
    @Args('jobId') jobId: string,
    @Args('file') fileInput: Base64FileInput,
    @CurrentUser() user: User,
  ) {
    const file = base64ToMulterFile(fileInput.base64, fileInput.originalName, fileInput.mimeType);
    new FileValidationPipe().transform(file);
    return this.photosService.uploadForJob(file, jobId, user.id);
  }

  @Mutation(() => PhotoModel, { description: '반려동물 사진 업로드' })
  async uploadPetPhoto(
    @Args('petId') petId: string,
    @Args('file') fileInput: Base64FileInput,
    @CurrentUser() user: User,
  ) {
    const file = base64ToMulterFile(fileInput.base64, fileInput.originalName, fileInput.mimeType);
    new FileValidationPipe().transform(file);
    return this.photosService.uploadForPet(file, petId, user.id);
  }

  @Mutation(() => Boolean, { description: '사진 삭제 (업로더만 가능)' })
  async deletePhoto(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ) {
    await this.photosService.deletePhoto(id, user.id);
    return true;
  }
}
