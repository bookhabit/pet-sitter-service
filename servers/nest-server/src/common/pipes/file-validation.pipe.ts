import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';

// ─── 검증 상수 ────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_FILE_SIZE = 1;               // 0바이트 파일 방지
const MAX_FILES_COUNT = 10;

// 파일 시그니처(Magic bytes) — MIME type 조작 우회 방어
// MIME type은 클라이언트 헤더로 조작 가능하므로 실제 바이너리로 검증
const MAGIC_BYTES: Record<string, { bytes: number[]; offset: number }[]> = {
  'image/jpeg': [{ bytes: [0xff, 0xd8, 0xff], offset: 0 }],
  'image/png':  [{ bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 }],
  'image/webp': [{ bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }], // 'WEBP' (RIFF 컨테이너 8바이트 이후)
};

// ─── 단건 파이프 ──────────────────────────────────────────────────

/**
 * 단일 파일 업로드 검증 파이프
 * @UseInterceptors(FileInterceptor('file')) 와 함께 사용
 *
 * @example
 * @UploadedFile(new FileValidationPipe()) file: Express.Multer.File
 */
@Injectable()
export class FileValidationPipe implements PipeTransform<Express.Multer.File> {
  transform(file: Express.Multer.File): Express.Multer.File {
    validateOne(file);
    return file;
  }
}

// ─── 다건 파이프 ──────────────────────────────────────────────────

/**
 * 다중 파일 업로드 검증 파이프
 * @UseInterceptors(FilesInterceptor('files', N)) 와 함께 사용
 *
 * @example
 * @UploadedFiles(new FilesValidationPipe()) files: Express.Multer.File[]
 */
@Injectable()
export class FilesValidationPipe
  implements PipeTransform<Express.Multer.File[]>
{
  transform(files: Express.Multer.File[]): Express.Multer.File[] {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }
    if (files.length > MAX_FILES_COUNT) {
      throw new BadRequestException(
        `Maximum ${MAX_FILES_COUNT} files allowed per request`,
      );
    }
    files.forEach(validateOne);
    return files;
  }
}

// ─── 공통 검증 함수 ───────────────────────────────────────────────

function validateOne(file: Express.Multer.File): void {
  // 1. 빈 파일 방지
  if (!file?.buffer || file.size < MIN_FILE_SIZE) {
    throw new BadRequestException('File must not be empty');
  }

  // 2. 파일 크기 (5MB 이하)
  if (file.size > MAX_FILE_SIZE) {
    throw new BadRequestException('File size must not exceed 5MB');
  }

  // 3. MIME type 화이트리스트 (1차 — 클라이언트 헤더)
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new BadRequestException(
      'Only JPEG, PNG, and WebP images are allowed',
    );
  }

  // 4. 확장자 화이트리스트 (MIME · 확장자 불일치 방지)
  const ext = extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new BadRequestException(
      'File extension must be .jpg, .jpeg, .png, or .webp',
    );
  }

  // 5. Magic bytes (2차 — 실제 바이너리 검증, MIME 조작 우회 방어)
  validateMagicBytes(file);
}

function validateMagicBytes(file: Express.Multer.File): void {
  const signatures = MAGIC_BYTES[file.mimetype];
  if (!signatures) {
    throw new BadRequestException('Unsupported image format');
  }

  const matched = signatures.some(({ bytes, offset }) => {
    if (file.buffer.length < offset + bytes.length) return false;
    return bytes.every((b, i) => file.buffer[offset + i] === b);
  });

  if (!matched) {
    throw new BadRequestException(
      'File content does not match the declared MIME type',
    );
  }
}
