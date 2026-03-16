'use client';

import { useEffect, useState } from 'react';

import type { JobsQueryParams } from '@/schemas/job.schema';

export interface JobFilters {
  activity: string;
  sort: string;
  start_time_after: string;
  start_time_before: string;
  end_time_after: string;
  end_time_before: string;
  petSpecies: string;
  petAgeAbove: string;
  petAgeBelow: string;
  minPrice: string;
  maxPrice: string;
}

const INITIAL_FILTERS: JobFilters = {
  activity: '',
  sort: '',
  start_time_after: '',
  start_time_before: '',
  end_time_after: '',
  end_time_before: '',
  petSpecies: '',
  petAgeAbove: '',
  petAgeBelow: '',
  minPrice: '',
  maxPrice: '',
};

const ACTIVITY_DEBOUNCE_MS = 400;

/**
 * [Logic Hook] 구인공고 목록 필터 상태를 관리합니다.
 *
 * 빈 문자열은 쿼리 파라미터에서 제외되며, 숫자 필드는 Number로 변환됩니다.
 * activity 필드는 400ms debounce가 적용되어 toQueryParams()에 반영됩니다.
 * UI 입력값(filters.activity)은 즉시 반영되어 타이핑 경험을 유지합니다.
 */
export function useJobFilters() {
  const [filters, setFilters] = useState<JobFilters>(INITIAL_FILTERS);
  const [debouncedActivity, setDebouncedActivity] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedActivity(filters.activity);
    }, ACTIVITY_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [filters.activity]);

  const setFilter = (key: keyof JobFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setDebouncedActivity('');
  };

  const toQueryParams = (): Omit<JobsQueryParams, 'cursor' | 'limit'> => {
    const params: Omit<JobsQueryParams, 'cursor' | 'limit'> = {};

    if (debouncedActivity) params.activity = debouncedActivity;
    if (filters.sort) params.sort = filters.sort;
    if (filters.start_time_after) params.start_time_after = filters.start_time_after;
    if (filters.start_time_before) params.start_time_before = filters.start_time_before;
    if (filters.end_time_after) params.end_time_after = filters.end_time_after;
    if (filters.end_time_before) params.end_time_before = filters.end_time_before;
    if (filters.petSpecies) params['pets[species]'] = filters.petSpecies;

    if (filters.petAgeAbove !== '') {
      const parsed = Number(filters.petAgeAbove);
      if (!isNaN(parsed)) params['pets[age_above]'] = parsed;
    }

    if (filters.petAgeBelow !== '') {
      const parsed = Number(filters.petAgeBelow);
      if (!isNaN(parsed)) params['pets[age_below]'] = parsed;
    }

    if (filters.minPrice !== '') {
      const parsed = Number(filters.minPrice);
      if (!isNaN(parsed)) params.min_price = parsed;
    }

    if (filters.maxPrice !== '') {
      const parsed = Number(filters.maxPrice);
      if (!isNaN(parsed)) params.max_price = parsed;
    }

    return params;
  };

  return {
    filters,
    setFilter,
    resetFilters,
    toQueryParams,
  };
}
