import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { useJobQuery, useUpdateJobMutation } from '@/hooks/jobs';
import { useUploadPhotosMutation } from '@/hooks/photos';
import { createJobFormSchema } from '@/schemas/job.schema';
import { getHttpErrorStatus } from '@/utils/get-http-error-status';
import { useJobPhotoFiles } from './useJobPhotoFiles';

import type {
  CreateJobFormInput,
  UpdateJobInput,
  PetSpecies,
  PriceType,
} from '@/schemas/job.schema';

/**
 * datetime-local input 은 "YYYY-MM-DDTHH:MM" 형식의 문자열을 요구한다.
 * Job 응답의 start_time / end_time 은 Zod z.coerce.date() 로 Date 객체로 변환되므로
 * 폼 defaultValues 에 주입하기 전에 이 형식으로 변환한다.
 */
function toDatetimeLocalString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * [Logic Hook] 구인공고 수정 폼 상태 + 서버 연결을 담당합니다.
 *
 * 흐름: useJobQuery(jobId) → defaultValues 주입 → useForm(zodResolver)
 *      → useFieldArray(pets) → useUploadPhotosMutation → useUpdateJobMutation → onSubmit
 * 사진 파일 상태는 useJobPhotoFiles에 위임합니다.
 * 사진이 있을 경우 사전 업로드 후 반환된 photo_ids를 UpdateJobInput에 포함합니다.
 */
export function useEditJobs(jobId: string) {
  const navigate = useNavigate();

  // 기존 공고 데이터 조회 (useSuspenseQuery — 렌더링 시점에 data가 항상 존재함)
  const { data: job } = useJobQuery(jobId);

  const { mutate, isPending, error, isSuccess } = useUpdateJobMutation(jobId);
  const { mutateAsync: uploadPhotos, isPending: isUploadPending } = useUploadPhotosMutation();

  // 업로드 실패 시 사용자에게 표시할 에러 메시지
  const [uploadServerError, setUploadServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateJobFormInput>({
    resolver: zodResolver(createJobFormSchema),
    defaultValues: {
      start_time: toDatetimeLocalString(job.start_time),
      end_time: toDatetimeLocalString(job.end_time),
      activity: job.activity,
      address: job.address ?? '',
      price: job.price !== null ? String(job.price) : '',
      price_type: job.price_type ?? undefined,
      pets: job.pets.map((pet) => ({
        name: pet.name,
        age: String(pet.age),
        species: pet.species,
        breed: pet.breed,
      })),
    },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'pets' });

  const watchPets = watch('pets');
  const watchPriceType = watch('price_type');

  const {
    jobFiles: selectedFiles,
    jobPreviewUrls: previewUrls,
    handleJobFileChange: handleFileChange,
    removeJobFile: removeFile,
    petFiles,
    petPreviewUrls,
    handlePetFileChange,
    removePetFile,
  } = useJobPhotoFiles(watchPets.length);

  useEffect(() => {
    if (isSuccess) {
      navigate(`/jobs/${jobId}`);
    }
  }, [isSuccess, jobId, navigate]);

  const serverError = (() => {
    if (uploadServerError) return uploadServerError;
    if (!error) return null;
    const status = getHttpErrorStatus(error);
    if (status === 403) return '구인공고 수정 권한이 없습니다.';
    if (status === 404) return '공고를 찾을 수 없습니다.';
    return '구인공고 수정 중 오류가 발생했습니다.';
  })();

  const addPet = () => {
    append({ name: '', age: '', species: '', breed: '' });
  };

  const removePet = (index: number) => {
    remove(index);
  };

  const selectSpecies = (index: number, species: PetSpecies) => {
    setValue(`pets.${index}.species` as `pets.${number}.species`, species, {
      shouldValidate: true,
    });
  };

  const selectPriceType = (priceType: PriceType) => {
    setValue('price_type', priceType, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (data) => {
    setUploadServerError(null);

    const submitData: UpdateJobInput = {
      start_time: data.start_time,
      end_time: data.end_time,
      activity: data.activity,
      pets: data.pets.map((pet) => ({
        name: pet.name,
        age: Number(pet.age),
        species: pet.species as PetSpecies,
        breed: pet.breed,
      })),
    };

    if (data.address) submitData.address = data.address;

    if (data.price !== undefined && data.price !== '') {
      submitData.price = Number(data.price);
      submitData.price_type = data.price_type;
    }

    try {
      if (selectedFiles.length > 0) {
        const uploadedJobPhotos = await uploadPhotos(selectedFiles);
        submitData.photo_ids = uploadedJobPhotos.map((photo) => photo.id);
      }

      for (let i = 0; i < (submitData.pets?.length ?? 0); i++) {
        const files = petFiles[i] ?? [];
        if (files.length > 0) {
          const uploadedPetPhotos = await uploadPhotos(files);
          if (submitData.pets) {
            submitData.pets[i].photo_ids = uploadedPetPhotos.map((photo) => photo.id);
          }
        }
      }
    } catch {
      setUploadServerError('사진 업로드 중 오류가 발생했습니다.');
      return;
    }

    mutate(submitData);
  });

  return {
    register,
    onSubmit,
    errors,
    isPending,
    isUploadPending,
    serverError,
    fields,
    addPet,
    remove: removePet,
    selectSpecies,
    watchPets,
    selectPriceType,
    watchPriceType,
    selectedFiles,
    previewUrls,
    handleFileChange,
    removeFile,
    petFiles,
    petPreviewUrls,
    handlePetFileChange,
    removePetFile,
  };
}
