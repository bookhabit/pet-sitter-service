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

/* ─── Input DTOs ─────────────────────────────────────────────── */

export const petInputSchema = z.object({
  name: z.string().min(2).max(20),
  age: z.number().int().min(1).max(100),
  species: petSpeciesSchema,
  breed: z.string(),
  size: z.string().optional(),
  photo_ids: z.array(z.string().uuid()).optional(),
});

export type PetInput = z.infer<typeof petInputSchema>;

export const createJobSchema = z.object({
  start_time: z.string(),
  end_time: z.string(),
  activity: z.string().min(5).max(500),
  pets: z.array(petInputSchema).min(1).max(10),
  photo_ids: z.array(z.string().uuid()).optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  price: z.number().int().min(0).optional(),
  price_type: priceTypeSchema.optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const updateJobSchema = createJobSchema.partial();

export type UpdateJobInput = z.infer<typeof updateJobSchema>;

/* ─── Query Params ───────────────────────────────────────────── */

export interface JobsQueryParams {
  limit?: number;
  cursor?: string;
  activity?: string;
  sort?: string;
  start_time_before?: string;
  start_time_after?: string;
  end_time_before?: string;
  end_time_after?: string;
  'pets[age_below]'?: number;
  'pets[age_above]'?: number;
  'pets[species]'?: string;
  min_price?: number;
  max_price?: number;
}
