import { Button, Flex, Spacing, Text, TextField } from '@/design-system';
import { OptionSelector } from './OptionSelector';

import type { JobFilters } from '@/hooks/forms/useJobFilters';
import { SORT_OPTIONS, SPECIES_OPTIONS, type SortValue } from '@/utils/options';
import type { PetSpecies } from '@/schemas/job.schema';

interface Props {
  filters: JobFilters;
  onFilterChange: (key: keyof JobFilters, value: string) => void;
  onReset: () => void;
}

/**
 * [UI Component] 구인공고 목록 필터 패널
 *
 * 필터 상태는 부모(JobListContainer)에서 제어(controlled)합니다.
 */
export function JobFilterPanel({ filters, onFilterChange, onReset }: Props) {
  return (
    <div className="rounded-2xl border border-grey200 bg-white p-24">
      <Flex justify="between" align="center">
        <Text size="t2" className="font-bold">
          필터
        </Text>
        <Button variant="ghost" size="sm" onClick={onReset}>
          필터 초기화
        </Button>
      </Flex>

      <Spacing size={24} />

      {/* 키워드 검색 */}
      <TextField
        label="돌봄 내용 검색"
        placeholder="키워드를 입력하세요"
        value={filters.activity}
        onChange={(e) => onFilterChange('activity', e.target.value)}
      />

      <Spacing size={24} />

      {/* 정렬 */}
      <OptionSelector<SortValue>
        label="정렬"
        options={SORT_OPTIONS}
        selectedValue={(filters.sort as SortValue) || undefined}
        onSelect={(value) => onFilterChange('sort', value)}
      />

      <Spacing size={24} />

      {/* 돌봄 시작일 */}
      <Text size="b2" color="secondary">
        돌봄 시작일
      </Text>
      <Spacing size={8} />
      <Flex gap={12}>
        <TextField
          label="이후"
          type="datetime-local"
          value={filters.start_time_after}
          onChange={(e) => onFilterChange('start_time_after', e.target.value)}
          className="flex-1"
        />
        <TextField
          label="이전"
          type="datetime-local"
          value={filters.start_time_before}
          onChange={(e) => onFilterChange('start_time_before', e.target.value)}
          className="flex-1"
        />
      </Flex>

      <Spacing size={24} />

      {/* 돌봄 종료일 */}
      <Text size="b2" color="secondary">
        돌봄 종료일
      </Text>
      <Spacing size={8} />
      <Flex gap={12}>
        <TextField
          label="이후"
          type="datetime-local"
          value={filters.end_time_after}
          onChange={(e) => onFilterChange('end_time_after', e.target.value)}
          className="flex-1"
        />
        <TextField
          label="이전"
          type="datetime-local"
          value={filters.end_time_before}
          onChange={(e) => onFilterChange('end_time_before', e.target.value)}
          className="flex-1"
        />
      </Flex>

      <Spacing size={24} />

      {/* 반려동물 종 */}
      <OptionSelector<PetSpecies>
        label="반려동물 종"
        options={SPECIES_OPTIONS}
        selectedValue={filters.petSpecies as PetSpecies}
        onSelect={(value) => onFilterChange('petSpecies', value)}
      />

      <Spacing size={16} />

      {/* 반려동물 나이 */}
      <Flex gap={12}>
        <TextField
          label="나이 하한 (세)"
          type="number"
          placeholder="0"
          value={filters.petAgeAbove}
          onChange={(e) => onFilterChange('petAgeAbove', e.target.value)}
          className="flex-1"
        />
        <TextField
          label="나이 상한 (세)"
          type="number"
          placeholder="20"
          value={filters.petAgeBelow}
          onChange={(e) => onFilterChange('petAgeBelow', e.target.value)}
          className="flex-1"
        />
      </Flex>

      <Spacing size={24} />

      {/* 가격 범위 */}
      <Flex gap={12}>
        <TextField
          label="최소 가격 (원)"
          type="number"
          placeholder="0"
          value={filters.minPrice}
          onChange={(e) => onFilterChange('minPrice', e.target.value)}
          className="flex-1"
        />
        <TextField
          label="최대 가격 (원)"
          type="number"
          placeholder="100000"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange('maxPrice', e.target.value)}
          className="flex-1"
        />
      </Flex>
    </div>
  );
}
