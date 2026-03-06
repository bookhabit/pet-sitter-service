import { z } from 'zod';

/* ─── 상태 열거형 ─────────────────────────────────────────────── */

export const approveStatusSchema = z.enum(['applying', 'approved', 'rejected']);
export type ApproveStatus = z.infer<typeof approveStatusSchema>;

/* ─── JobApplication ─────────────────────────────────────────── */

export const jobApplicationSchema = z.object({
  id: z.string().uuid(),
  status: approveStatusSchema,
  user_id: z.string().uuid(),
  job_id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type JobApplication = z.infer<typeof jobApplicationSchema>;

/* ─── 목록 응답 ──────────────────────────────────────────────── */

export const jobApplicationListSchema = z.object({
  items: z.array(jobApplicationSchema),
});

export type JobApplicationList = z.infer<typeof jobApplicationListSchema>;

/* ─── 입력 DTO ───────────────────────────────────────────────── */

export const updateJobApplicationSchema = z.object({
  status: approveStatusSchema,
});

export type UpdateJobApplicationInput = z.infer<typeof updateJobApplicationSchema>;
