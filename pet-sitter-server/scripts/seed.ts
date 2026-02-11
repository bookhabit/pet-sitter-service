import { PrismaClient, Role, PetSpecies, ApproveStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  // Production 환경에서 실행 방지
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ Seed는 production 환경에서 실행할 수 없습니다.');
  }

  console.log('🌱 테스트 데이터 생성 시작...\n');

  // 기존 데이터 삭제 (외래키 순서 주의)
  console.log('🗑️  기존 데이터 삭제 중...');
  await prisma.review.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.job.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ 기존 데이터 삭제 완료\n');

  // ──────────────────────────────────────────
  // 1. Users 생성
  // ──────────────────────────────────────────
  console.log('👥 Users 생성 중...');
  const [owner1, owner2, sitter1, sitter2, admin, both] = await Promise.all([
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'owner1@test.com',
        full_name: '김주인',
        password: 'password123',
        roles: [Role.PetOwner],
      },
    }),
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'owner2@test.com',
        full_name: '이주인',
        password: 'password123',
        roles: [Role.PetOwner],
      },
    }),
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'sitter1@test.com',
        full_name: '박돌봄',
        password: 'password123',
        roles: [Role.PetSitter],
      },
    }),
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'sitter2@test.com',
        full_name: '최돌봄',
        password: 'password123',
        roles: [Role.PetSitter],
      },
    }),
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'admin@test.com',
        full_name: '관리자',
        password: 'password123',
        roles: [Role.Admin],
      },
    }),
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'both@test.com',
        full_name: '양면인',
        password: 'password123',
        roles: [Role.PetOwner, Role.PetSitter],
      },
    }),
  ]);
  console.log('✅ 6명의 사용자 생성 완료\n');

  // ──────────────────────────────────────────
  // 2. Jobs 생성
  // ──────────────────────────────────────────
  console.log('💼 Jobs 생성 중...');
  const now = new Date();

  // job1: owner1 소유 | 지원자 있음 (applying 상태) | 리뷰 불가 (approved 없음)
  const job1 = await prisma.job.create({
    data: {
      id: randomUUID(),
      creator_user_id: owner1.id,
      start_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      end_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      activity: '강아지 산책 도우미 구합니다',
      pets: {
        create: [
          { id: randomUUID(), name: '뽀삐', age: 3, species: PetSpecies.Dog, breed: '골든 리트리버', size: '대형' },
          { id: randomUUID(), name: '치즈', age: 2, species: PetSpecies.Dog, breed: '비글', size: '중형' },
        ],
      },
    },
    include: { pets: true },
  });

  // job2: owner1 소유 | sitter1 approved | 양방향 리뷰 모두 완료 (seed에서 미리 생성)
  const job2 = await prisma.job.create({
    data: {
      id: randomUUID(),
      creator_user_id: owner1.id,
      start_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      end_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      activity: '고양이 돌봄 서비스 요청합니다',
      pets: {
        create: [
          { id: randomUUID(), name: '나비', age: 1, species: PetSpecies.Cat, breed: '페르시안', size: '소형' },
        ],
      },
    },
    include: { pets: true },
  });

  // job3: owner2 소유 | sitter2 approved | PetOwner(owner2)만 리뷰 작성 완료 → sitter2 아직 미작성
  const job3 = await prisma.job.create({
    data: {
      id: randomUUID(),
      creator_user_id: owner2.id,
      start_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      end_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      activity: '허스키 산책 도우미 구합니다',
      pets: {
        create: [
          { id: randomUUID(), name: '멍멍이', age: 5, species: PetSpecies.Dog, breed: '시베리안 허스키', size: '대형' },
        ],
      },
    },
    include: { pets: true },
  });

  // job4: owner2 소유 | 지원자 없음 | 리뷰 불가
  const job4 = await prisma.job.create({
    data: {
      id: randomUUID(),
      creator_user_id: owner2.id,
      start_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      end_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      activity: '고양이 두 마리 돌봄 요청합니다',
      pets: {
        create: [
          { id: randomUUID(), name: '야옹이', age: 4, species: PetSpecies.Cat, breed: '러시안 블루', size: '중형' },
          { id: randomUUID(), name: '구름이', age: 2, species: PetSpecies.Cat, breed: '스코티시 폴드', size: '소형' },
        ],
      },
    },
    include: { pets: true },
  });

  // job5: both 소유 | sitter1 approved | 리뷰 미작성 (테스트용)
  const job5 = await prisma.job.create({
    data: {
      id: randomUUID(),
      creator_user_id: both.id,
      start_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      end_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      activity: '소형견 산책 도우미 구합니다',
      pets: {
        create: [
          { id: randomUUID(), name: '복실이', age: 3, species: PetSpecies.Dog, breed: '푸들', size: '소형' },
        ],
      },
    },
    include: { pets: true },
  });

  const jobs = [job1, job2, job3, job4, job5];
  console.log(`✅ ${jobs.length}개의 구인공고 생성 완료\n`);

  // ──────────────────────────────────────────
  // 3. JobApplications 생성
  // ──────────────────────────────────────────
  console.log('📝 JobApplications 생성 중...');

  const applications = await Promise.all([
    // job1: sitter1 지원 (applying) — 리뷰 불가 케이스
    prisma.jobApplication.create({
      data: { id: randomUUID(), user_id: sitter1.id, job_id: job1.id, status: ApproveStatus.applying },
    }),
    // job1: sitter2 지원 (applying) — 리뷰 불가 케이스
    prisma.jobApplication.create({
      data: { id: randomUUID(), user_id: sitter2.id, job_id: job1.id, status: ApproveStatus.applying },
    }),
    // job2: sitter1 승인 — 양방향 리뷰 완료 케이스
    prisma.jobApplication.create({
      data: { id: randomUUID(), user_id: sitter1.id, job_id: job2.id, status: ApproveStatus.approved },
    }),
    // job3: sitter2 승인 — PetOwner만 리뷰 완료 케이스 (sitter2 미작성)
    prisma.jobApplication.create({
      data: { id: randomUUID(), user_id: sitter2.id, job_id: job3.id, status: ApproveStatus.approved },
    }),
    // job3: sitter1 거절 — 거절된 지원자는 리뷰 불가
    prisma.jobApplication.create({
      data: { id: randomUUID(), user_id: sitter1.id, job_id: job3.id, status: ApproveStatus.rejected },
    }),
    // job5: sitter1 승인 — 리뷰 미작성 (직접 테스트용)
    prisma.jobApplication.create({
      data: { id: randomUUID(), user_id: sitter1.id, job_id: job5.id, status: ApproveStatus.approved },
    }),
  ]);

  console.log(`✅ ${applications.length}개의 지원서 생성 완료\n`);

  // ──────────────────────────────────────────
  // 4. Reviews 생성
  // ──────────────────────────────────────────
  console.log('⭐ Reviews 생성 중...');

  const reviews = await Promise.all([
    // [job2] owner1 → sitter1: 양방향 리뷰 (오너 측) — 이미 완료 케이스
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 5,
        comment: '매우 친절하고 꼼꼼하게 돌봐주셨어요. 다음에도 꼭 부탁드리겠습니다!',
        reviewer_id: owner1.id,
        reviewee_id: sitter1.id,
        job_id: job2.id,
      },
    }),
    // [job2] sitter1 → owner1: 양방향 리뷰 (시터 측) — 이미 완료 케이스
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 4,
        comment: '고양이가 순해서 돌보기 편했어요. 집이 깔끔하고 지시사항도 명확했습니다.',
        reviewer_id: sitter1.id,
        reviewee_id: owner1.id,
        job_id: job2.id,
      },
    }),
    // [job3] owner2 → sitter2: 오너만 작성 완료 — sitter2 미작성 케이스
    prisma.review.create({
      data: {
        id: randomUUID(),
        rating: 3,
        comment: '산책은 잘 해주셨는데 시간을 좀 지켜주셨으면 좋겠어요.',
        reviewer_id: owner2.id,
        reviewee_id: sitter2.id,
        job_id: job3.id,
      },
    }),
  ]);

  console.log(`✅ ${reviews.length}개의 리뷰 생성 완료\n`);

  // ──────────────────────────────────────────
  // 요약 출력
  // ──────────────────────────────────────────
  console.log('═══════════════════════════════════════════');
  console.log('📊 생성된 테스트 데이터 요약');
  console.log('═══════════════════════════════════════════');
  console.log(`   Users:           ${6}명`);
  console.log(`   Jobs:            ${jobs.length}개`);
  console.log(`   Pets:            ${jobs.reduce((sum, job) => sum + job.pets.length, 0)}마리`);
  console.log(`   JobApplications: ${applications.length}개`);
  console.log(`   Reviews:         ${reviews.length}개`);
  console.log('');

  console.log('🔑 테스트 계정 (email / password)');
  console.log('───────────────────────────────────────────');
  console.log('   PetOwner 1:  owner1@test.com / password123');
  console.log('   PetOwner 2:  owner2@test.com / password123');
  console.log('   PetSitter 1: sitter1@test.com / password123');
  console.log('   PetSitter 2: sitter2@test.com / password123');
  console.log('   Admin:       admin@test.com / password123');
  console.log('   Both:        both@test.com / password123');
  console.log('');

  console.log('📋 리뷰 기능 테스트 시나리오');
  console.log('───────────────────────────────────────────');
  console.log('   [job2] ★ 양방향 리뷰 완료 (이미 둘 다 작성됨)');
  console.log('          owner1(김주인) ──5점──▶ sitter1(박돌봄)');
  console.log('          sitter1(박돌봄) ─4점──▶ owner1(김주인)');
  console.log('          → 다시 작성 시도 시 409 Conflict');
  console.log('');
  console.log('   [job3] ★ 오너만 리뷰 완료 → 시터 작성 가능');
  console.log('          owner2(이주인) ──3점──▶ sitter2(최돌봄) ✅ 완료');
  console.log('          sitter2(최돌봄) ──────▶ owner2(이주인)  ⬜ 미작성');
  console.log('          → sitter2로 로그인 후 job3에 리뷰 작성 가능');
  console.log('');
  console.log('   [job5] ★ 양방향 모두 미작성 → 두 계정 모두 작성 가능');
  console.log('          both(양면인) ──────────▶ sitter1(박돌봄)  ⬜ 미작성');
  console.log('          sitter1(박돌봄) ────────▶ both(양면인)    ⬜ 미작성');
  console.log('');
  console.log('   [job1] ★ approved 없음 → 리뷰 불가 (400 Bad Request)');
  console.log('   [job4] ★ 지원자 없음   → 리뷰 불가 (400 Bad Request)');
  console.log('═══════════════════════════════════════════');
  console.log('✅ 테스트 데이터 생성 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
