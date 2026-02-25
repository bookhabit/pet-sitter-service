import { z } from 'zod';

import { photoSchema } from './user.schema';

/* ─── 공통 열거형 ────────────────────────────────────────────── */

export const petSpeciesSchema = z.enum(['Cat', 'Dog']);
export type PetSpecies = z.infer<typeof petSpeciesSchema>;

export const priceTypeSchema = z.enum(['hourly', 'daily']);
export type PriceType = z.infer<typeof priceTypeSchema>;

/* ─── Pet ────────────────────────────────────────────────────── */

export const petSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  age: z.number(),
  species: petSpeciesSchema,
  breed: z.string(),
  size: z.string().nullable(),
  job_id: z.string().uuid(),
  // 목록 조회에서는 포함되지 않을 수 있으므로 optional
  photos: z.array(photoSchema).optional().default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Pet = z.infer<typeof petSchema>;

/* ─── Job ────────────────────────────────────────────────────── */

export const jobSchema = z.object({
  id: z.string().uuid(),
  creator_user_id: z.string().uuid(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  activity: z.string(),
  address: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  price: z.number().int().nullable(),
  price_type: priceTypeSchema.nullable(),
  pets: z.array(petSchema),
  photos: z.array(photoSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Job = z.infer<typeof jobSchema>;

/* ─── Pagination ─────────────────────────────────────────────── */

export const pageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable().optional(),
});

export type PageInfo = z.infer<typeof pageInfoSchema>;

export const paginatedJobsSchema = z.object({
  items: z.array(jobSchema),
  pageInfo: pageInfoSchema,
});

export type PaginatedJobs = z.infer<typeof paginatedJobsSchema>;

/* ─── Query Params ───────────────────────────────────────────── */

export interface JobsQueryParams {
  limit?: number;
  cursor?: string;
  activity?: string;
  sort?: string;
}
