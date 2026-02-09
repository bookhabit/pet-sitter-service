import { PrismaClient, Role, PetSpecies, ApproveStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  // Production 환경에서 실행 방지
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ Seed는 production 환경에서 실행할 수 없습니다.');
  }

  console.log('🌱 테스트 데이터 생성 시작...\n');

  // 기존 데이터 삭제 (선택사항 - 주석 처리하면 기존 데이터 유지)
  console.log('🗑️  기존 데이터 삭제 중...');
  await prisma.jobApplication.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.job.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ 기존 데이터 삭제 완료\n');

  // 1. Users 생성
  console.log('👥 Users 생성 중...');
  const users = await Promise.all([
    // PetOwner 1
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'owner1@test.com',
        full_name: '김주인',
        password: 'password123', // 실제로는 해시화되어야 함
        roles: [Role.PetOwner],
      },
    }),
    // PetOwner 2
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'owner2@test.com',
        full_name: '이주인',
        password: 'password123',
        roles: [Role.PetOwner],
      },
    }),
    // PetSitter 1
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'sitter1@test.com',
        full_name: '박돌봄',
        password: 'password123',
        roles: [Role.PetSitter],
      },
    }),
    // PetSitter 2
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'sitter2@test.com',
        full_name: '최돌봄',
        password: 'password123',
        roles: [Role.PetSitter],
      },
    }),
    // Admin
    prisma.user.create({
      data: {
        id: randomUUID(),
        email: 'admin@test.com',
        full_name: '관리자',
        password: 'password123',
        roles: [Role.Admin],
      },
    }),
    // PetOwner + PetSitter (둘 다 가능)
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
  console.log(`✅ ${users.length}명의 사용자 생성 완료\n`);

  // 2. Jobs 생성 (각 PetOwner가 여러 개의 Job 생성)
  console.log('💼 Jobs 생성 중...');
  const now = new Date();
  const jobs = [];

  // Owner1의 Jobs
  const owner1 = users[0];
  const job1 = await prisma.job.create({
    data: {
      id: randomUUID(),
      creator_user_id: owner1.id,
      start_time: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 내일
      end_time: new Date(now.getTime() + 25 * 60 * 60 * 1000), // 내일 + 1시간
      activity: '산책',
      pets: {
        create: [
          {
            id: randomUUID(),
            name: '뽀삐',
            age: 3,
            species: PetSpecies.Dog,
            breed: '골든 리트리버',
            size: '대형',
          },
          {
            id: randomUUID(),
            name: '치즈',
            age: 2,
            species: PetSpecies.Dog,
            breed: '비글',
            size: '중형',
          },
        ],
      },
    },
    include: { pets: true },
  });
  jobs.push(job1);

  const job2 = await prisma.job.create({
    data: {
      id: randomUUID(),
      creator_user_id: owner1.id,
      start_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 모레
      end_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 모레 + 3시간
      activity: '돌봄',
      pets: {
        create: [
          {
            id: randomUUID(),
            name: '나비',
            age: 1,
            species: PetSpecies.Cat,
            breed: '페르시안',
            size: '소형',
          },
        ],
      },
    },
    include: { pets: true },
  });
  jobs.push(job2);

  // Owner2의 Jobs
  const owner2 = users[1];
  const job3 = await prisma.job.create({
    data: {
      id: randomUUID(),
      creator_user_id: owner2.id,
      start_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3일 후
      end_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 3일 후 + 2시간
      activity: '산책',
      pets: {
        create: [
          {
            id: randomUUID(),
            name: '멍멍이',
            age: 5,
            species: PetSpecies.Dog,
            breed: '시베리안 허스키',
            size: '대형',
          },
        ],
      },
    },
    include: { pets: true },
  });
  jobs.push(job3);

  const job4 = await prisma.job.create({
    data: {
      id: randomUUID(),
      creator_user_id: owner2.id,
      start_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5일 후
      end_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 5일 후 + 4시간
      activity: '돌봄',
      pets: {
        create: [
          {
            id: randomUUID(),
            name: '야옹이',
            age: 4,
            species: PetSpecies.Cat,
            breed: '러시안 블루',
            size: '중형',
          },
          {
            id: randomUUID(),
            name: '토끼',
            age: 2,
            species: PetSpecies.Cat,
            breed: '스코티시 폴드',
            size: '소형',
          },
        ],
      },
    },
    include: { pets: true },
  });
  jobs.push(job4);

  // Both (PetOwner + PetSitter)의 Job
  const both = users[5];
  const job5 = await prisma.job.create({
    data: {
      id: randomUUID(),
      creator_user_id: both.id,
      start_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7일 후
      end_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 7일 후 + 6시간
      activity: '산책',
      pets: {
        create: [
          {
            id: randomUUID(),
            name: '복실이',
            age: 3,
            species: PetSpecies.Dog,
            breed: '푸들',
            size: '소형',
          },
        ],
      },
    },
    include: { pets: true },
  });
  jobs.push(job5);

  console.log(`✅ ${jobs.length}개의 구인공고 생성 완료\n`);

  // 3. JobApplications 생성
  console.log('📝 JobApplications 생성 중...');
  const sitter1 = users[2];
  const sitter2 = users[3];

  const applications = await Promise.all([
    // Sitter1이 Job1에 지원
    prisma.jobApplication.create({
      data: {
        id: randomUUID(),
        user_id: sitter1.id,
        job_id: job1.id,
        status: ApproveStatus.applying,
      },
    }),
    // Sitter1이 Job2에 지원
    prisma.jobApplication.create({
      data: {
        id: randomUUID(),
        user_id: sitter1.id,
        job_id: job2.id,
        status: ApproveStatus.approved,
      },
    }),
    // Sitter2가 Job1에 지원
    prisma.jobApplication.create({
      data: {
        id: randomUUID(),
        user_id: sitter2.id,
        job_id: job1.id,
        status: ApproveStatus.applying,
      },
    }),
    // Sitter2가 Job3에 지원
    prisma.jobApplication.create({
      data: {
        id: randomUUID(),
        user_id: sitter2.id,
        job_id: job3.id,
        status: ApproveStatus.approved,
      },
    }),
    // Sitter1이 Job3에 지원 (거절됨)
    prisma.jobApplication.create({
      data: {
        id: randomUUID(),
        user_id: sitter1.id,
        job_id: job3.id,
        status: ApproveStatus.rejected,
      },
    }),
  ]);

  console.log(`✅ ${applications.length}개의 지원서 생성 완료\n`);

  // 결과 요약
  console.log('📊 생성된 테스트 데이터 요약:');
  console.log(`   - Users: ${users.length}명`);
  console.log(`   - Jobs: ${jobs.length}개`);
  console.log(`   - Pets: ${jobs.reduce((sum, job) => sum + job.pets.length, 0)}마리`);
  console.log(`   - JobApplications: ${applications.length}개\n`);

  console.log('🔑 테스트 계정 정보:');
  console.log('   PetOwner 1: owner1@test.com / password123');
  console.log('   PetOwner 2: owner2@test.com / password123');
  console.log('   PetSitter 1: sitter1@test.com / password123');
  console.log('   PetSitter 2: sitter2@test.com / password123');
  console.log('   Admin: admin@test.com / password123');
  console.log('   Both: both@test.com / password123\n');

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
