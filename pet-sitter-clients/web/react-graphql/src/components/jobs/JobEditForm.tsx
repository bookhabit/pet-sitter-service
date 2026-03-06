import { Badge, Button, Divider, Flex, Spacing, Text, TextArea, TextField } from '@/design-system';
import {
  CalendarIcon,
  DogIcon,
  DollarSignIcon,
  MapIcon,
  PlusIcon,
  TrashIcon,
} from '@/design-system/icons';
import { useEditJobs } from '@/hooks/forms/useEditJobs';

import type { PetSpecies, PriceType } from '@/schemas/job.schema';

import { OptionSelector } from './OptionSelector';
import { PRICE_TYPE_OPTIONS, SPECIES_OPTIONS } from '@/utils/options';

interface Props {
  jobId: string;
}

/**
 * [Container + View] 구인공고 수정 폼 컴포넌트
 *
 * - 비즈니스 로직: useEditJobs 위임
 * - 역할: UI 렌더링만 담당
 * - JobCreateForm 과 동일한 구조이며 수정용 hook(useEditJobs)을 사용한다.
 */
export default function JobEditForm({ jobId }: Props) {
  const {
    register,
    onSubmit,
    errors,
    isPending,
    isUploadPending,
    serverError,
    fields,
    addPet,
    remove,
    selectSpecies,
    watchPets,
    selectPriceType,
    watchPriceType,
    previewUrls,
    handleFileChange,
    removeFile,
    petPreviewUrls,
    handlePetFileChange,
    removePetFile,
  } = useEditJobs(jobId);

  const isSubmitting = isPending || isUploadPending;

  return (
    <div className="mx-auto max-w-2xl px-16 py-32">
      {/* 페이지 헤더 */}
      <Flex direction="column" gap={4} align="start">
        <Text size="t1" as="h1">
          구인공고 수정
        </Text>
        <Text size="b2" color="secondary">
          돌봄 일정과 반려동물 정보를 수정해주세요.
        </Text>
      </Flex>

      <Spacing size={32} />

      {/* 서버 에러 배너 */}
      {serverError && (
        <>
          <p className="rounded-xl border border-red-200 bg-red-50 px-16 py-12 text-b2 text-danger">
            {serverError}
          </p>
          <Spacing size={16} />
        </>
      )}

      <form onSubmit={onSubmit}>
        <Flex direction="column" gap={0} align="stretch">
          {/* ─── 섹션 1: 돌봄 일정 ─── */}
          <div className="rounded-2xl border border-grey200 bg-white p-24">
            <Flex align="center" gap={8} className="mb-20">
              <div className="bg-primary/10 flex size-32 items-center justify-center rounded-lg">
                <CalendarIcon size={18} color="var(--blue500)" />
              </div>
              <Text size="t2" as="h2">
                돌봄 일정
              </Text>
            </Flex>

            <Flex direction="column" gap={16} align="stretch">
              <TextField
                label="시작 일시"
                type="datetime-local"
                error={errors.start_time?.message}
                {...register('start_time')}
              />
              <TextField
                label="종료 일시"
                type="datetime-local"
                error={errors.end_time?.message}
                {...register('end_time')}
              />
            </Flex>
          </div>

          <Spacing size={16} />

          {/* ─── 섹션 2: 돌봄 내용 ─── */}
          <div className="rounded-2xl border border-grey200 bg-white p-24">
            <Flex align="center" gap={8} className="mb-20">
              <div className="bg-primary/10 flex size-32 items-center justify-center rounded-lg">
                <DogIcon size={18} color="var(--blue500)" />
              </div>
              <Text size="t2" as="h2">
                돌봄 내용
              </Text>
            </Flex>

            <TextArea
              label="내용"
              rows={4}
              placeholder="돌봄 내용을 입력해주세요. (5자 이상)"
              error={errors.activity?.message}
              {...register('activity')}
            />
          </div>

          <Spacing size={16} />

          {/* ─── 섹션 3: 반려동물 ─── */}
          <div className="rounded-2xl border border-grey200 bg-white p-24">
            <Flex align="center" gap={8} className="mb-20">
              <div className="bg-primary/10 flex size-32 items-center justify-center rounded-lg">
                <DogIcon size={18} color="var(--blue500)" />
              </div>
              <Text size="t2" as="h2">
                반려동물 정보
              </Text>
            </Flex>

            <Flex direction="column" gap={16} align="stretch">
              {fields.map((field, index) => (
                <div key={field.id} className="p-20 rounded-xl border border-grey200 bg-background">
                  {/* 반려동물 카드 헤더 */}
                  <Flex justify="between" align="center" className="mb-16">
                    <Flex align="center" gap={8}>
                      <Badge variant="primary" size="sm">
                        {index + 1}
                      </Badge>
                      <Text size="b1" as="span" className="font-bold">
                        반려동물 {index + 1}
                      </Text>
                    </Flex>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex items-center gap-4 rounded-lg px-8 py-4 text-caption text-text-secondary transition-colors hover:bg-red-50 hover:text-danger"
                      aria-label={`반려동물 ${index + 1} 삭제`}
                    >
                      <TrashIcon size={14} />
                      <span>삭제</span>
                    </button>
                  </Flex>

                  <Flex direction="column" gap={12} align="stretch">
                    <TextField
                      label="이름"
                      id={`pets.${index}.name`}
                      placeholder="예: 뽀삐"
                      error={errors.pets?.[index]?.name?.message}
                      {...register(`pets.${index}.name`)}
                    />

                    <TextField
                      label="나이"
                      id={`pets.${index}.age`}
                      placeholder="예: 3"
                      error={errors.pets?.[index]?.age?.message}
                      {...register(`pets.${index}.age`)}
                    />

                    <OptionSelector
                      label="동물 종"
                      options={SPECIES_OPTIONS}
                      selectedValue={watchPets[index]?.species as PetSpecies | undefined}
                      onSelect={(species) => selectSpecies(index, species)}
                      error={errors.pets?.[index]?.species?.message}
                    />

                    <TextField
                      label="품종"
                      id={`pets.${index}.breed`}
                      placeholder="예: 말티즈"
                      error={errors.pets?.[index]?.breed?.message}
                      {...register(`pets.${index}.breed`)}
                    />

                    {/* 반려동물 사진 업로드 */}
                    <div>
                      <Text size="b2" color="secondary" as="label" className="mb-8 block">
                        반려동물 사진{' '}
                        <span className="text-caption text-text-secondary">(선택)</span>
                      </Text>

                      <label
                        htmlFor={`pet-photos-${index}`}
                        className="py-20 hover:bg-primary/5 flex cursor-pointer items-center justify-center gap-8 rounded-xl border border-dashed border-grey200 px-16 transition-colors hover:border-primary"
                      >
                        <PlusIcon size={16} color="var(--grey600)" />
                        <Text size="b2" color="secondary" as="span">
                          사진 선택
                        </Text>
                      </label>
                      <input
                        id={`pet-photos-${index}`}
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) => handlePetFileChange(index, e)}
                      />

                      {(petPreviewUrls[index]?.length ?? 0) > 0 && (
                        <div className="mt-12 flex flex-wrap gap-8">
                          {petPreviewUrls[index].map((url, fileIndex) => (
                            <div key={url} className="relative size-64">
                              <img
                                src={url}
                                alt={`반려동물 ${index + 1} 미리보기 ${fileIndex + 1}`}
                                className="size-full rounded-lg object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removePetFile(index, fileIndex)}
                                className="size-20 absolute right-4 top-4 flex items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                                aria-label={`반려동물 ${index + 1} 사진 ${fileIndex + 1} 제거`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Flex>
                </div>
              ))}

              {/* 반려동물 추가 버튼 + 배열 레벨 에러 */}
              <div>
                <button
                  type="button"
                  onClick={addPet}
                  className="hover:bg-primary/5 flex w-full items-center justify-center gap-8 rounded-xl border border-dashed border-primary py-16 text-b2 font-bold text-primary transition-colors"
                >
                  <PlusIcon size={18} color="var(--blue500)" />
                  반려동물 추가
                </button>
                {errors.pets?.root?.message && (
                  <span className="mt-8 block text-caption text-danger" role="alert">
                    {errors.pets.root.message}
                  </span>
                )}
              </div>
            </Flex>
          </div>

          <Spacing size={16} />

          {/* ─── 섹션 4: 선택 정보 ─── */}
          <div className="rounded-2xl border border-grey200 bg-white p-24">
            <Flex align="center" gap={8} className="mb-20">
              <div className="bg-primary/10 flex size-32 items-center justify-center rounded-lg">
                <DollarSignIcon size={18} color="var(--blue500)" />
              </div>
              <Text size="t2" as="h2">
                추가 정보{' '}
                <span className="ml-4 text-caption font-normal text-text-secondary">(선택)</span>
              </Text>
            </Flex>

            <Flex direction="column" gap={16} align="stretch">
              <TextField
                label="주소"
                placeholder="예: 서울시 강남구"
                leftIcon={<MapIcon size={18} />}
                {...register('address')}
              />

              <Divider />

              <TextField
                label="가격"
                placeholder="예: 20000"
                error={errors.price?.message}
                leftIcon={<DollarSignIcon size={18} />}
                {...register('price')}
              />

              <OptionSelector
                label="가격 단위"
                options={PRICE_TYPE_OPTIONS}
                selectedValue={watchPriceType}
                onSelect={selectPriceType}
                error={errors.price_type?.message}
              />
            </Flex>
          </div>

          <Spacing size={16} />

          {/* ─── 섹션 5: 사진 업로드 ─── */}
          <div className="rounded-2xl border border-grey200 bg-white p-24">
            <Flex align="center" gap={8} className="mb-20">
              <div className="bg-primary/10 flex size-32 items-center justify-center rounded-lg">
                <CalendarIcon size={18} color="var(--blue500)" />
              </div>
              <Text size="t2" as="h2">
                사진{' '}
                <span className="ml-4 text-caption font-normal text-text-secondary">(선택)</span>
              </Text>
            </Flex>

            <label
              htmlFor="job-photos"
              className="hover:bg-primary/5 flex cursor-pointer items-center justify-center gap-8 rounded-xl border border-dashed border-grey200 px-16 py-24 transition-colors hover:border-primary"
            >
              <PlusIcon size={18} color="var(--grey600)" />
              <Text size="b1" color="secondary" as="span">
                사진 선택
              </Text>
            </label>
            <input
              id="job-photos"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleFileChange}
            />

            {previewUrls.length > 0 && (
              <div className="mt-16 flex flex-wrap gap-8">
                {previewUrls.map((url, index) => (
                  <div key={url} className="size-80 relative">
                    <img
                      src={url}
                      alt={`미리보기 ${index + 1}`}
                      className="size-full rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="size-20 absolute right-4 top-4 flex items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                      aria-label={`사진 ${index + 1} 제거`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Spacing size={24} />

          {/* 제출 버튼 */}
          <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
            구인공고 수정
          </Button>

          <Spacing size={32} />
        </Flex>
      </form>
    </div>
  );
}
