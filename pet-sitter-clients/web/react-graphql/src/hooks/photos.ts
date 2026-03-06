import { useState, useCallback } from 'react';
import { useApolloClient } from '@apollo/client';

import { uploadWithFetch } from '@/api/apollo-client';
import { photoSchema } from '@/schemas/user.schema';
import { z } from 'zod';

import type { Photo } from '@/schemas/user.schema';

/**
 * useMutation 인터페이스를 모방하는 파일 업로드 훅 팩토리
 *
 * GraphQL 파일 업로드(graphql-multipart-request-spec)는 apollo-upload-client가 필요하므로,
 * 사진 업로드는 uploadWithFetch 헬퍼를 통해 REST 엔드포인트에 직접 FormData POST를 수행합니다.
 */
function usePhotoUpload<TArgs, TResult>(
  fetcher: (args: TArgs) => Promise<TResult>,
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TResult | null>(null);

  const mutateAsync = useCallback(
    async (args: TArgs): Promise<TResult> => {
      setIsPending(true);
      setError(null);
      try {
        const result = await fetcher(args);
        setData(result);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setIsPending(false);
      }
    },
    [fetcher],
  );

  const mutate = (args: TArgs) => {
    mutateAsync(args).catch(() => {});
  };

  return { mutate, mutateAsync, isPending, error, data, isSuccess: !!data && !isPending };
}

/* ─── 업로드 헬퍼 ────────────────────────────────────────────── */

const uploadMany = async (files: File[]): Promise<Photo[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const result = await uploadWithFetch<unknown[]>('/photos/upload', formData);
  return z.array(photoSchema).parse(result);
};

const uploadUserPhoto = async ({ userId, file }: { userId: string; file: File }): Promise<Photo> => {
  const formData = new FormData();
  formData.append('file', file);
  const result = await uploadWithFetch<unknown>(`/users/${userId}/photos`, formData);
  return photoSchema.parse(result);
};

const uploadJobPhoto = async ({ jobId, file }: { jobId: string; file: File }): Promise<Photo> => {
  const formData = new FormData();
  formData.append('file', file);
  const result = await uploadWithFetch<unknown>(`/jobs/${jobId}/photos`, formData);
  return photoSchema.parse(result);
};

const uploadPetPhoto = async ({ petId, file }: { petId: string; file: File }): Promise<Photo> => {
  const formData = new FormData();
  formData.append('file', file);
  const result = await uploadWithFetch<unknown>(`/pets/${petId}/photos`, formData);
  return photoSchema.parse(result);
};

const deletePhoto = async (id: string): Promise<void> => {
  const token = (await import('@/store/useAuthStore')).useAuthStore.getState().token;
  const response = await fetch(`http://localhost:8000/photos/${id}`, {
    method: 'DELETE',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`HTTP ${response.status}`);
  }
};

/* ─── Mutation Hooks ─────────────────────────────────────────── */

/**
 * [Mutation Hook] POST /photos/upload
 * 공고/반려동물 등록 전 photo_ids 획득 목적의 사전 업로드
 *
 * @example
 * const { mutateAsync } = useUploadPhotosMutation();
 * const photos = await mutateAsync([file1, file2]);
 * const photoIds = photos.map((p) => p.id);
 */
export function useUploadPhotosMutation() {
  return usePhotoUpload(uploadMany);
}

/**
 * [Mutation Hook] POST /users/:id/photos
 * 성공 시 users 관련 캐시 갱신
 */
export function useUploadUserPhotoMutation(userId: string) {
  const client = useApolloClient();
  const hook = usePhotoUpload(({ file }: { file: File }) =>
    uploadUserPhoto({ userId, file }),
  );

  const mutateAsync = async (file: File): Promise<Photo> => {
    const result = await hook.mutateAsync({ file });
    client.refetchQueries({ include: ['GetUser'] });
    return result;
  };

  const mutate = (file: File) => {
    mutateAsync(file).catch(() => {});
  };

  return { ...hook, mutate, mutateAsync };
}

/**
 * [Mutation Hook] POST /jobs/:id/photos
 * 성공 시 해당 공고 상세 캐시 갱신
 */
export function useUploadJobPhotoMutation(jobId: string) {
  const client = useApolloClient();
  const hook = usePhotoUpload(({ file }: { file: File }) =>
    uploadJobPhoto({ jobId, file }),
  );

  const mutateAsync = async (file: File): Promise<Photo> => {
    const result = await hook.mutateAsync({ file });
    client.refetchQueries({ include: ['GetJob'] });
    return result;
  };

  const mutate = (file: File) => {
    mutateAsync(file).catch(() => {});
  };

  return { ...hook, mutate, mutateAsync };
}

/**
 * [Mutation Hook] POST /pets/:id/photos
 * 성공 시 해당 공고 상세 캐시 갱신 (반려동물은 공고에 종속)
 */
export function useUploadPetPhotoMutation(_jobId: string) {
  const client = useApolloClient();
  const hook = usePhotoUpload(
    ({ petId, file }: { petId: string; file: File }) => uploadPetPhoto({ petId, file }),
  );

  const mutateAsync = async (args: { petId: string; file: File }): Promise<Photo> => {
    const result = await hook.mutateAsync(args);
    client.refetchQueries({ include: ['GetJob'] });
    return result;
  };

  const mutate = (args: { petId: string; file: File }) => {
    mutateAsync(args).catch(() => {});
  };

  return { ...hook, mutate, mutateAsync };
}

/**
 * [Mutation Hook] DELETE /photos/:id
 * 삭제 후 목록/상세 캐시를 넓게 갱신
 */
export function useDeletePhotoMutation() {
  const client = useApolloClient();
  const hook = usePhotoUpload(deletePhoto);

  const mutate = (id: string) => {
    hook.mutateAsync(id)
      .then(() => {
        client.refetchQueries({ include: ['GetJob', 'GetJobs', 'GetUser'] });
      })
      .catch(() => {});
  };

  return { ...hook, mutate };
}
