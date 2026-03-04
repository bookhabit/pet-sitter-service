import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { useCreateJobMutation } from '@/hooks/jobs';
import { createJobFormSchema } from '@/schemas/job.schema';

import type {
  CreateJobFormInput,
  CreateJobInput,
  PetSpecies,
  PriceType,
} from '@/schemas/job.schema';

/**
 * [Logic Hook] 구인공고 등록 폼 상태 + 서버 연결을 담당합니다.
 *
 * 흐름: useForm(zodResolver) → useFieldArray(pets) → useCreateJobMutation → onSubmit
 */
export function useCreateJobs() {
  const navigate = useNavigate();
  const { mutate, isPending, error, isSuccess, data: createdJob } = useCreateJobMutation();

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

  useEffect(() => {
    if (isSuccess && createdJob && 'id' in (createdJob as object)) {
      navigate(`/jobs/${(createdJob as { id: string }).id}`);
    }
  }, [isSuccess, createdJob, navigate]);

  const serverError = (() => {
    if (!error) return null;
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 403) return '구인공고 등록 권한이 없습니다.';
    return '구인공고 등록 중 오류가 발생했습니다.';
  })();

  const addPet = () => {
    append({ name: '', age: '', species: '', breed: '' });
  };

  const selectSpecies = (index: number, species: PetSpecies) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(`pets.${index}.species` as any, species, { shouldValidate: true });
  };

  const selectPriceType = (priceType: PriceType) => {
    setValue('price_type', priceType, { shouldValidate: true });
  };

  const watchPets = watch('pets');
  const watchPriceType = watch('price_type');

  const onSubmit = handleSubmit((data) => {
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

    mutate(submitData);
  });

  return {
    register,
    onSubmit,
    errors,
    isPending,
    serverError,
    fields,
    addPet,
    remove,
    selectSpecies,
    watchPets,
    selectPriceType,
    watchPriceType,
  };
}
