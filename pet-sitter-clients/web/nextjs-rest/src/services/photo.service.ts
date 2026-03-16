import { z } from 'zod';

import { privateApi } from '../api/axios-instance';
import { photoSchema } from '../schemas/user.schema';

import type { Photo } from '../schemas/user.schema';

const validate = <T>(data: unknown, schema: z.ZodSchema<T>): T => schema.parse(data);

/**
 * POST /photos/upload          — 다중 파일 업로드 → Photo[] (photo_ids 획득용)
 * POST /users/:id/photos       — 사용자 프로필 사진 업로드 → Photo
 * POST /jobs/:id/photos        — 공고 사진 업로드 → Photo
 * POST /pets/:id/photos        — 반려동물 사진 업로드 → Photo
 * DELETE /photos/:id           — 사진 삭제 (204 No Content)
 */
export const photoService = {
  /** 다중 파일 업로드. 공고/반려동물 등록 전 photo_ids 획득에 사용 */
  uploadMany: (files: File[]): Promise<Photo[]> => {
    console.log('업로드할 파일들:', files);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      return privateApi
        .post('/photos/upload', formData, {
          headers: {
            // 중요: undefined로 설정하면 Axios가 고정된 'application/json'을 지우고
            // 브라우저가 FormData에 맞는 'multipart/form-data; boundary=...'를 자동 생성하게 합니다.
            'Content-Type': undefined,
          },
        })
        .then((res) => validate(res.data, z.array(photoSchema)));
    } catch (error) {
      console.error('사진 업로드 중 오류:', error);
      throw error;
    }
  },

  /** 사용자 프로필 사진 업로드 */
  uploadUserPhoto: (userId: string, file: File): Promise<Photo> => {
    const formData = new FormData();
    formData.append('file', file);
    return privateApi
      .post(`/users/${userId}/photos`, formData, {
        headers: {
          // 중요: undefined로 설정하면 Axios가 고정된 'application/json'을 지우고
          // 브라우저가 FormData에 맞는 'multipart/form-data; boundary=...'를 자동 생성하게 합니다.
          'Content-Type': undefined,
        },
      })
      .then((res) => validate(res.data, photoSchema));
  },

  /** 공고 사진 업로드 */
  uploadJobPhoto: (jobId: string, file: File): Promise<Photo> => {
    const formData = new FormData();
    formData.append('file', file);
    return privateApi
      .post(`/jobs/${jobId}/photos`, formData, {
        headers: {
          // 중요: undefined로 설정하면 Axios가 고정된 'application/json'을 지우고
          // 브라우저가 FormData에 맞는 'multipart/form-data; boundary=...'를 자동 생성하게 합니다.
          'Content-Type': undefined,
        },
      })
      .then((res) => validate(res.data, photoSchema));
  },

  /** 반려동물 사진 업로드 */
  uploadPetPhoto: (petId: string, file: File): Promise<Photo> => {
    const formData = new FormData();
    formData.append('file', file);
    return privateApi
      .post(`/pets/${petId}/photos`, formData, {
        headers: {
          // 중요: undefined로 설정하면 Axios가 고정된 'application/json'을 지우고
          // 브라우저가 FormData에 맞는 'multipart/form-data; boundary=...'를 자동 생성하게 합니다.
          'Content-Type': undefined,
        },
      })
      .then((res) => validate(res.data, photoSchema));
  },

  /** 사진 삭제 (204 No Content) */
  deletePhoto: (id: string): Promise<void> =>
    privateApi.delete(`/photos/${id}`).then(() => undefined),
};
