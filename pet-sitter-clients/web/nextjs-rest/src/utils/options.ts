import type { PetSpecies, PriceType } from '@/schemas/job.schema';

export const SPECIES_OPTIONS: { value: PetSpecies; label: string }[] = [
  { value: 'Dog', label: 'Dog' },
  { value: 'Cat', label: 'Cat' },
];

export const PRICE_TYPE_OPTIONS: { value: PriceType; label: string }[] = [
  { value: 'hourly', label: '시간당' },
  { value: 'daily', label: '일당' },
];

export type SortValue = 'start_time_asc' | 'start_time_desc' | 'end_time_asc' | 'end_time_desc';

export const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: 'start_time_asc', label: '시작일 빠른순' },
  { value: 'start_time_desc', label: '시작일 늦은순' },
  { value: 'end_time_asc', label: '종료일 빠른순' },
  { value: 'end_time_desc', label: '종료일 늦은순' },
];
