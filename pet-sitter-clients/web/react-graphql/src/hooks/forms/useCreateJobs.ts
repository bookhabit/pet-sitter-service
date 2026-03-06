import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { useCreateJobMutation } from '@/hooks/jobs';
import { useUploadPhotosMutation } from '@/hooks/photos';
import { createJobFormSchema } from '@/schemas/job.schema';
import { getHttpErrorStatus } from '@/utils/get-http-error-status';
import { useJobPhotoFiles } from './useJobPhotoFiles';

import type {
  CreateJobFormInput,
  CreateJobInput,
  PetSpecies,
  PriceType,
} from '@/schemas/job.schema';

/**
 * [Logic Hook] 구인공고 등록 폼 상태 + 서버 연결을 담당합니다.
 *
 * 흐름: useForm(zodResolver) → useFieldArray(pets) → useUploadPhotosMutation → useCreateJobMutation → onSubmit
 * 사진 파일 상태는 useJobPhotoFiles에 위임합니다.
 * 사진이 있을 경우 사전 업로드 후 반환된 photo_ids를 CreateJobInput에 포함합니다.
 */
export function useCreateJobs() {
  const navigate = useNavigate();
  const { mutate, isPending, error, isSuccess, data: createdJob } = useCreateJobMutation();
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
    defaultValues: { pets: [] },
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

  // createdJob is typed as Job by jobService.createJob — Job has id: string
  useEffect(() => {
    if (isSuccess && createdJob) {
      navigate(`/jobs/${createdJob.id}`);
    }
  }, [isSuccess, createdJob, navigate]);

  const serverError = (() => {
    if (uploadServerError) return uploadServerError;
    if (!error) return null;
    const status = getHttpErrorStatus(error);
    if (status === 403) return '구인공고 등록 권한이 없습니다.';
    return '구인공고 등록 중 오류가 발생했습니다.';
  })();

  const addPet = () => {
    append({ name: '', age: '', species: '', breed: '' });
    // petFiles 동기화는 useJobPhotoFiles가 watchPets.length 변화를 감지해 처리
  };

  const removePet = (index: number) => {
    remove(index);
    // petFiles 동기화는 useJobPhotoFiles가 watchPets.length 변화를 감지해 처리
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
    // 이전 업로드 에러 초기화
    setUploadServerError(null);

    const submitData: CreateJobInput = {
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
      // job 전체 사진 업로드 (파일이 없으면 서버가 400을 반환하므로 조건부 호출)
      if (selectedFiles.length > 0) {
        const uploadedJobPhotos = await uploadPhotos(selectedFiles);
        submitData.photo_ids = uploadedJobPhotos.map((photo) => photo.id);
      }

      // pet별 사진 업로드 (각 pet에 파일이 없으면 건너뜀)
      for (let i = 0; i < submitData.pets.length; i++) {
        const files = petFiles[i] ?? [];
        if (files.length > 0) {
          const uploadedPetPhotos = await uploadPhotos(files);
          submitData.pets[i].photo_ids = uploadedPetPhotos.map((photo) => photo.id);
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
