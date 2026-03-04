import { Button, Flex, Spacing, TextArea, TextField } from '@/design-system';
import { useCreateJobs } from '@/hooks/forms/useCreateJobs';

import type { PetSpecies, PriceType } from '@/schemas/job.schema';

import { OptionSelector } from './OptionSelector';

const SPECIES_OPTIONS: { value: PetSpecies; label: string }[] = [
  { value: 'Dog', label: 'Dog' },
  { value: 'Cat', label: 'Cat' },
];

const PRICE_TYPE_OPTIONS: { value: PriceType; label: string }[] = [
  { value: 'hourly', label: '시간당' },
  { value: 'daily', label: '일당' },
];

/**
 * [Container + View] 구인공고 등록 폼 컴포넌트
 *
 * - 비즈니스 로직: useCreateJobs 위임
 * - 역할: UI 렌더링만 담당
 */
export default function JobCreateForm() {
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
  } = useCreateJobs();

  const isSubmitting = isPending || isUploadPending;

  return (
    <div className="mx-auto max-w-2xl px-16 py-24">
      <h1 className="text-h2 mb-24 text-text-primary">구인공고 등록</h1>

      {serverError && (
        <p className="mb-16 rounded-xl border border-red-200 bg-red-50 px-16 py-12 text-b2 text-danger">
          {serverError}
        </p>
      )}

      <form onSubmit={onSubmit}>
        <Flex direction="column" gap={16} align="stretch">
          {/* 돌봄 일정 */}
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

          {/* 돌봄 내용 */}
          <TextArea
            label="내용"
            rows={4}
            placeholder="돌봄 내용을 입력해주세요. (5자 이상)"
            error={errors.activity?.message}
            {...register('activity')}
          />

          {/* 반려동물 목록 */}
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-grey200 bg-background p-16">
              <Flex justify="between" align="center" className="mb-12">
                <span className="text-b1 font-bold text-text-primary">반려동물 {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-text-secondary hover:text-danger"
                >
                  삭제
                </Button>
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
                  <label className="mb-8 block text-b2 font-bold text-text-primary">
                    반려동물 사진 (선택)
                  </label>

                  <label
                    htmlFor={`pet-photos-${index}`}
                    className="py-20 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-grey200 px-16 text-b2 text-text-secondary hover:bg-background"
                  >
                    + 사진 선택
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
                    <div className="mt-12 flex flex-wrap gap-12">
                      {petPreviewUrls[index].map((url, fileIndex) => (
                        <div key={url} className="h-40 w-40 relative">
                          <img
                            src={url}
                            alt={`반려동물 ${index + 1} 미리보기 ${fileIndex + 1}`}
                            className="h-full w-full rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePetFile(index, fileIndex)}
                            className="h-20 w-20 absolute right-4 top-4 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
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
            <Button type="button" variant="ghost" size="md" onClick={addPet} className="w-full">
              반려동물 추가
            </Button>
            {errors.pets?.root?.message && (
              <span className="mt-8 block text-caption text-danger" role="alert">
                {errors.pets.root.message}
              </span>
            )}
          </div>

          <Spacing size={8} />

          {/* 선택 항목 */}
          <TextField label="주소" placeholder="예: 서울시 강남구 (선택)" {...register('address')} />

          <TextField
            label="가격"
            placeholder="예: 20000 (선택)"
            error={errors.price?.message}
            {...register('price')}
          />

          <OptionSelector
            label="가격 단위"
            options={PRICE_TYPE_OPTIONS}
            selectedValue={watchPriceType}
            onSelect={selectPriceType}
            error={errors.price_type?.message}
          />

          <Spacing size={8} />

          {/* job 전체 사진 업로드 */}
          <div>
            <label className="mb-8 block text-b2 font-bold text-text-primary">사진 (선택)</label>

            <label
              htmlFor="job-photos"
              className="py-20 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-grey200 px-16 text-b2 text-text-secondary hover:bg-background"
            >
              + 사진 선택
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
              <div className="mt-12 flex flex-wrap gap-12">
                {previewUrls.map((url, index) => (
                  <div key={url} className="h-40 w-40 relative">
                    <img
                      src={url}
                      alt={`미리보기 ${index + 1}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="h-20 w-20 absolute right-4 top-4 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                      aria-label={`사진 ${index + 1} 제거`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Spacing size={8} />

          <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
            등록
          </Button>
        </Flex>
      </form>
    </div>
  );
}
