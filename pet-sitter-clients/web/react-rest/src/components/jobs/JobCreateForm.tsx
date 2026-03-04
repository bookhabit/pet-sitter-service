import { Button, Flex, Spacing, TextField } from '@/design-system';
import { useCreateJobs } from '@/hooks/forms/useCreateJobs';

import type { PetSpecies, PriceType } from '@/schemas/job.schema';

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
    serverError,
    fields,
    addPet,
    remove,
    selectSpecies,
    watchPets,
    selectPriceType,
    watchPriceType,
  } = useCreateJobs();

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
          <div className="flex flex-col gap-8">
            <label htmlFor="내용" className="text-b2 text-text-secondary">
              내용
            </label>
            <textarea
              id="내용"
              rows={4}
              className="aria-invalid:border-danger w-full rounded-xl border border-grey200 px-16 py-12 text-b1 text-text-primary outline-none transition-all placeholder:text-text-secondary focus:border-primary"
              aria-invalid={!!errors.activity}
              placeholder="돌봄 내용을 입력해주세요. (5자 이상)"
              {...register('activity')}
            />
            {errors.activity && (
              <span className="text-caption text-danger" role="alert">
                {errors.activity.message}
              </span>
            )}
          </div>

          {/* 반려동물 목록 */}
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-grey200 bg-background p-16">
              <Flex justify="between" align="center" className="mb-12">
                <span className="text-b1 font-bold text-text-primary">반려동물 {index + 1}</span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-caption text-text-secondary hover:text-danger"
                >
                  삭제
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

                {/* 동물 종 선택 */}
                <div className="flex flex-col gap-8">
                  <span className="text-b2 text-text-secondary">동물 종</span>
                  <Flex gap={8}>
                    {SPECIES_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => selectSpecies(index, value)}
                        className={`py-10 rounded-xl border px-16 text-b2 font-bold transition-all ${
                          watchPets[index]?.species === value
                            ? 'border-primary bg-primary text-white'
                            : 'border-grey200 bg-white text-text-primary hover:brightness-95'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </Flex>
                  {errors.pets?.[index]?.species && (
                    <span className="text-caption text-danger" role="alert">
                      {errors.pets[index].species.message}
                    </span>
                  )}
                </div>

                <TextField
                  label="품종"
                  id={`pets.${index}.breed`}
                  placeholder="예: 말티즈"
                  error={errors.pets?.[index]?.breed?.message}
                  {...register(`pets.${index}.breed`)}
                />
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
          <TextField
            label="주소"
            placeholder="예: 서울시 강남구 (선택)"
            error={undefined}
            {...register('address')}
          />

          <TextField
            label="가격"
            placeholder="예: 20000 (선택)"
            error={errors.price?.message}
            {...register('price')}
          />

          {/* 가격 단위 선택 */}
          <div className="flex flex-col gap-8">
            <span className="text-b2 text-text-secondary">가격 단위</span>
            <Flex gap={8}>
              {PRICE_TYPE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectPriceType(value)}
                  className={`py-10 rounded-xl border px-16 text-b2 font-bold transition-all ${
                    watchPriceType === value
                      ? 'border-primary bg-primary text-white'
                      : 'border-grey200 bg-white text-text-primary hover:brightness-95'
                  }`}
                >
                  {label}
                </button>
              ))}
            </Flex>
            {errors.price_type && (
              <span className="text-caption text-danger" role="alert">
                {errors.price_type.message}
              </span>
            )}
          </div>

          <Spacing size={8} />

          <Button type="submit" size="lg" disabled={isPending} className="w-full">
            등록
          </Button>
        </Flex>
      </form>
    </div>
  );
}
