import { vi } from 'vitest';

import type { Job } from '@/schemas/job.schema';
import type { User } from '@/schemas/user.schema';

// ─── Pet ───────────────────────────────────────────────────────────────────

export const mockDogPet = {
  id: 'pet-dog-uuid-1',
  name: '뽀삐',
  age: 3,
  species: 'Dog' as const,
  breed: '말티즈',
  size: null,
  job_id: 'job-uuid-1',
  photos: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockCatPet = {
  id: 'pet-cat-uuid-1',
  name: '나비',
  age: 5,
  species: 'Cat' as const,
  breed: '페르시안',
  size: null,
  job_id: 'job-uuid-2',
  photos: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// ─── Job ───────────────────────────────────────────────────────────────────

export const mockJob: Job = {
  id: 'job-uuid-1',
  creator_user_id: 'owner-uuid-1',
  start_time: new Date('2024-06-01T09:00:00'),
  end_time: new Date('2024-06-01T18:00:00'),
  activity: '강아지 산책 및 돌봄을 부탁드립니다.',
  address: '서울시 강남구',
  latitude: 37.5,
  longitude: 127.0,
  price: 20000,
  price_type: 'hourly',
  pets: [mockDogPet],
  photos: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockJobNoOptionals: Job = {
  id: 'job-uuid-3',
  creator_user_id: 'owner-uuid-1',
  start_time: new Date('2024-07-01T10:00:00'),
  end_time: new Date('2024-07-01T14:00:00'),
  activity: '고양이 먹이주기만 부탁드립니다.',
  address: null,
  latitude: null,
  longitude: null,
  price: null,
  price_type: null,
  pets: [{ ...mockCatPet, job_id: 'job-uuid-3' }],
  photos: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// ─── Users ─────────────────────────────────────────────────────────────────

export const mockPetOwner: User = {
  id: 'owner-uuid-1',
  email: 'owner@test.com',
  full_name: '김주인',
  roles: ['PetOwner'],
  photos: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockPetSitter: User = {
  id: 'sitter-uuid-1',
  email: 'sitter@test.com',
  full_name: '박시터',
  roles: ['PetSitter'],
  photos: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// 공고를 등록하지 않은 다른 PetOwner
export const mockOtherOwner: User = {
  id: 'other-owner-uuid-2',
  email: 'other@test.com',
  full_name: '이타주인',
  roles: ['PetOwner'],
  photos: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// ─── Query mock helpers ────────────────────────────────────────────────────

export function makeJobsQueryResult(jobs: Job[] = [mockJob], hasNextPage = false) {
  return {
    data: {
      pages: [
        {
          items: jobs,
          pageInfo: {
            hasNextPage,
            endCursor: hasNextPage ? 'cursor-abc' : null,
          },
        },
      ],
      pageParams: [undefined],
    },
    fetchNextPage: vi.fn(),
    hasNextPage,
    isFetchingNextPage: false,
  };
}

export function makeJobQueryResult(job: Job = mockJob) {
  return { data: job };
}
