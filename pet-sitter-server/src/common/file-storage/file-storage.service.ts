import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

export type FileSubDir = 'users' | 'jobs' | 'pets' | 'temp';

export interface SavedFile {
  fileName: string; // 저장 경로 (subDir/uuid.ext)
  url: string;      // HTTP 접근 가능한 URL
}

const UPLOADS_ROOT = join(process.cwd(), 'uploads');

@Injectable()
export class FileStorageService {
  /**
   * 파일을 디스크에 저장하고 URL을 반환합니다.
   * 향후 S3 등으로 전환 시 이 메서드 내부만 교체하면 됩니다.
   */
  save(file: Express.Multer.File, subDir: FileSubDir): SavedFile {
    const dir = join(UPLOADS_ROOT, subDir);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const ext = extname(file.originalname).toLowerCase();
    const uuid = randomUUID();
    const fileName = `${subDir}/${uuid}${ext}`;
    const fullPath = join(UPLOADS_ROOT, fileName);

    writeFileSync(fullPath, file.buffer);

    return { fileName, url: `/uploads/${fileName}` };
  }

  /**
   * 디스크에서 파일을 삭제합니다.
   * 파일이 없으면 무시합니다.
   */
  delete(fileName: string): void {
    const filePath = join(UPLOADS_ROOT, fileName);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}
