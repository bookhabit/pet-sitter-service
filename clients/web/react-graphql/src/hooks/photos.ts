import { useCallback } from 'react';
import { useMutation, useApolloClient } from '@apollo/client';

import {
  UPLOAD_PHOTOS,
  UPLOAD_USER_PHOTO,
  UPLOAD_JOB_PHOTO,
  UPLOAD_PET_PHOTO,
  DELETE_PHOTO,
} from '@/graphql/mutations/photos';

import type { Photo } from '@/schemas/user.schema';

/* ─── Base64 변환 헬퍼 ───────────────────────────────────────── */

/** File → base64 문자열 (data:... prefix 제거) */
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/** File → Base64FileInput */
const fileToBase64Input = async (file: File) => ({
  base64: await fileToBase64(file),
  mimeType: file.type,
  originalName: file.name,
});

/* ─── Mutation Hooks ─────────────────────────────────────────── */

/**
 * [Mutation Hook] 다중 사진 업로드 (entity 미연결)
 * 서버 스키마: uploadPhotos(files: [Base64FileInput!]!): [PhotoModel!]!
 *
 * @example
 * const { mutateAsync } = useUploadPhotosMutation();
 * const photos = await mutateAsync([file1, file2]);
 * const photoIds = photos.map((p) => p.id);
 */
export function useUploadPhotosMutation() {
  const [execute, { loading, error, data }] = useMutation<{ uploadPhotos: Photo[] }>(
    UPLOAD_PHOTOS,
  );

  const mutateAsync = useCallback(
    async (files: File[]): Promise<Photo[]> => {
      const filesInput = await Promise.all(files.map(fileToBase64Input));
      const result = await execute({ variables: { files: filesInput } });
      return result.data!.uploadPhotos;
    },
    [execute],
  );

  const mutate = (files: File[]) => {
    mutateAsync(files).catch(() => {});
  };

  return {
    mutate,
    mutateAsync,
    isPending: loading,
    error: error ?? null,
    data: data?.uploadPhotos ?? null,
    isSuccess: !!data && !loading,
  };
}

/**
 * [Mutation Hook] 사용자 프로필 사진 업로드
 * 서버 스키마: uploadUserPhoto(file: Base64FileInput!, userId: String!): PhotoModel!
 */
export function useUploadUserPhotoMutation(userId: string) {
  const client = useApolloClient();
  const [execute, { loading, error, data }] = useMutation<{ uploadUserPhoto: Photo }>(
    UPLOAD_USER_PHOTO,
  );

  const mutateAsync = useCallback(
    async (file: File): Promise<Photo> => {
      const fileInput = await fileToBase64Input(file);
      const result = await execute({ variables: { userId, file: fileInput } });
      client.refetchQueries({ include: ['GetUser'] });
      return result.data!.uploadUserPhoto;
    },
    [execute, userId, client],
  );

  const mutate = (file: File) => {
    mutateAsync(file).catch(() => {});
  };

  return {
    mutate,
    mutateAsync,
    isPending: loading,
    error: error ?? null,
    data: data?.uploadUserPhoto ?? null,
    isSuccess: !!data && !loading,
  };
}

/**
 * [Mutation Hook] 공고 사진 업로드
 * 서버 스키마: uploadJobPhoto(file: Base64FileInput!, jobId: String!): PhotoModel!
 */
export function useUploadJobPhotoMutation(jobId: string) {
  const client = useApolloClient();
  const [execute, { loading, error, data }] = useMutation<{ uploadJobPhoto: Photo }>(
    UPLOAD_JOB_PHOTO,
  );

  const mutateAsync = useCallback(
    async (file: File): Promise<Photo> => {
      const fileInput = await fileToBase64Input(file);
      const result = await execute({ variables: { jobId, file: fileInput } });
      client.refetchQueries({ include: ['GetJob'] });
      return result.data!.uploadJobPhoto;
    },
    [execute, jobId, client],
  );

  const mutate = (file: File) => {
    mutateAsync(file).catch(() => {});
  };

  return {
    mutate,
    mutateAsync,
    isPending: loading,
    error: error ?? null,
    data: data?.uploadJobPhoto ?? null,
    isSuccess: !!data && !loading,
  };
}

/**
 * [Mutation Hook] 반려동물 사진 업로드
 * 서버 스키마: uploadPetPhoto(file: Base64FileInput!, petId: String!): PhotoModel!
 */
export function useUploadPetPhotoMutation(_jobId: string) {
  const client = useApolloClient();
  const [execute, { loading, error, data }] = useMutation<{ uploadPetPhoto: Photo }>(
    UPLOAD_PET_PHOTO,
  );

  const mutateAsync = useCallback(
    async (args: { petId: string; file: File }): Promise<Photo> => {
      const fileInput = await fileToBase64Input(args.file);
      const result = await execute({ variables: { petId: args.petId, file: fileInput } });
      client.refetchQueries({ include: ['GetJob'] });
      return result.data!.uploadPetPhoto;
    },
    [execute, client],
  );

  const mutate = (args: { petId: string; file: File }) => {
    mutateAsync(args).catch(() => {});
  };

  return {
    mutate,
    mutateAsync,
    isPending: loading,
    error: error ?? null,
    data: data?.uploadPetPhoto ?? null,
    isSuccess: !!data && !loading,
  };
}

/**
 * [Mutation Hook] 사진 삭제
 * 서버 스키마: deletePhoto(id: String!): Boolean!
 */
export function useDeletePhotoMutation() {
  const client = useApolloClient();
  const [execute, { loading, error, data }] = useMutation<{ deletePhoto: boolean }>(DELETE_PHOTO);

  const mutate = (id: string) => {
    execute({ variables: { id } })
      .then(() => {
        client.refetchQueries({ include: ['GetJob', 'GetJobs', 'GetUser'] });
      })
      .catch(() => {});
  };

  return {
    mutate,
    isPending: loading,
    error: error ?? null,
    isSuccess: !!data && !loading,
  };
}
