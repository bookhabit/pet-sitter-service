import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileStorageService } from '../common/file-storage/file-storage.service';
import { Photo } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class PhotosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorage: FileStorageService,
  ) {}

  /**
   * 다중 파일 업로드 (entity 미연결 — orphan 상태)
   * 파일 검증은 FilesValidationPipe에서 처리됨
   * 이후 attachToJob / attachToPet / attachToUser 로 entity 연결
   */
  async uploadMany(
    files: Express.Multer.File[],
    uploaderId: string,
  ): Promise<Photo[]> {
    return this.prisma.$transaction(
      files.map((file) => {
        const { fileName, url } = this.fileStorage.save(file, 'temp');
        return this.prisma.photo.create({
          data: {
            id: randomUUID(),
            url,
            file_name: fileName,
            original_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
            uploader_id: uploaderId,
          },
        });
      }),
    );
  }

  /**
   * 업로드된 사진들을 Job에 연결
   */
  async attachToJob(photoIds: string[], jobId: string): Promise<void> {
    if (!photoIds.length) return;
    await this.prisma.photo.updateMany({
      where: { id: { in: photoIds } },
      data: { job_id: jobId },
    });
  }

  /**
   * 업로드된 사진들을 Pet에 연결
   */
  async attachToPet(photoIds: string[], petId: string): Promise<void> {
    if (!photoIds.length) return;
    await this.prisma.photo.updateMany({
      where: { id: { in: photoIds } },
      data: { pet_id: petId },
    });
  }

  /**
   * 업로드된 사진들을 User에 연결
   */
  async attachToUser(photoIds: string[], userId: string): Promise<void> {
    if (!photoIds.length) return;
    await this.prisma.photo.updateMany({
      where: { id: { in: photoIds } },
      data: { user_id: userId },
    });
  }

  // ─── 기존 단건 업로드 (하위 호환) ──────────────────────────────
  // 파일 검증은 FileValidationPipe에서 처리됨

  async uploadForUser(
    file: Express.Multer.File,
    userId: string,
    uploaderId: string,
  ): Promise<Photo> {
    await this.ensureUserExists(userId);
    const { fileName, url } = this.fileStorage.save(file, 'users');
    return this.prisma.photo.create({
      data: {
        id: randomUUID(),
        url,
        file_name: fileName,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        uploader_id: uploaderId,
        user_id: userId,
      },
    });
  }

  async uploadForJob(
    file: Express.Multer.File,
    jobId: string,
    uploaderId: string,
  ): Promise<Photo> {
    await this.ensureJobExists(jobId);
    const { fileName, url } = this.fileStorage.save(file, 'jobs');
    return this.prisma.photo.create({
      data: {
        id: randomUUID(),
        url,
        file_name: fileName,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        uploader_id: uploaderId,
        job_id: jobId,
      },
    });
  }

  async uploadForPet(
    file: Express.Multer.File,
    petId: string,
    uploaderId: string,
  ): Promise<Photo> {
    await this.ensurePetExists(petId);
    const { fileName, url } = this.fileStorage.save(file, 'pets');
    return this.prisma.photo.create({
      data: {
        id: randomUUID(),
        url,
        file_name: fileName,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        uploader_id: uploaderId,
        pet_id: petId,
      },
    });
  }

  async deletePhoto(id: string, requesterId: string): Promise<void> {
    const photo = await this.prisma.photo.findUnique({ where: { id } });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }
    if (photo.uploader_id !== requesterId) {
      throw new ForbiddenException('Only the uploader can delete this photo');
    }

    this.fileStorage.delete(photo.file_name);
    await this.prisma.photo.delete({ where: { id } });
  }

  // ─── private ──────────────────────────────────────────────────

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
  }

  private async ensureJobExists(jobId: string): Promise<void> {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
  }

  private async ensurePetExists(petId: string): Promise<void> {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new NotFoundException('Pet not found');
  }
}
