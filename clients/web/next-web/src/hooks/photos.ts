'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { jobQueryKeys } from '@/hooks/jobs';
import { photoService } from '@/services/photo.service';

/**
 * [Mutation Hook] POST /photos/upload
 * 공고/반려동물 등록 전 photo_ids 획득 목적의 사전 업로드
 * 반환된 Photo 배열에서 id만 추출해 CreateJobInput.photo_ids 등에 전달
 */
export function useUploadPhotosMutation() {
  return useMutation({
    mutationFn: (files: File[]) => photoService.uploadMany(files),
  });
}

/**
 * [Mutation Hook] POST /users/:id/photos
 * 성공 시 users 관련 캐시 무효화
 */
export function useUploadUserPhotoMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => photoService.uploadUserPhoto(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  });
}

/**
 * [Mutation Hook] POST /jobs/:id/photos
 * 성공 시 해당 공고 상세 캐시 무효화
 */
export function useUploadJobPhotoMutation(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => photoService.uploadJobPhoto(jobId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.detail(jobId) });
    },
  });
}

/**
 * [Mutation Hook] POST /pets/:id/photos
 * 성공 시 해당 공고 상세 캐시 무효화 (반려동물은 공고에 종속)
 */
export function useUploadPetPhotoMutation(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ petId, file }: { petId: string; file: File }) =>
      photoService.uploadPetPhoto(petId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.detail(jobId) });
    },
  });
}

/**
 * [Mutation Hook] DELETE /photos/:id
 * 삭제 후 목록/상세 캐시를 넓게 무효화
 */
export function useDeletePhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => photoService.deletePhoto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
