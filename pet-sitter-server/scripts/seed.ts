import { PrismaClient, Role, PetSpecies, ApproveStatus, PriceType } from '@prisma/client';
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
  await prisma.chatRoomRead.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.favorite.deleteMany();
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
  // 위치: 서울 강남구 | 시급 15,000원
  const job1 = await prisma.job.create({
    data: {
      id: randomUUID(),
      creator_user_id: owner1.id,
      start_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      end_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      activity: '강아지 산책 도우미 구합니다',
      address: '서울 강남구 역삼동',
      latitude: 37.5012,
      longitude: 127.0396,
      price: 15000,
      price_type: PriceType.hourly,
      pets: {
        create: [
          { id: randomUUID(), name: '뽀삐', age: 3, species: PetSpecies.Dog, breed: '골든 리트리버', size: '대형' },
          { id: randomUUID(), name: '치즈', age: 2, species: PetSpecies.Dog, breed: '비글', size: '중형' },
        ],
      },
    },
    include: { pets: true },
  });

  // job2: owner1 소유 | sitter1 approved | 양방향 리뷰 모두 완료
  // 위치: 서울 마포구 | 일당 50,000원
  const job2 = await prisma.job.create({
    data: {
      id: randomUUID(),
      creator_user_id: owner1.id,
      start_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      end_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      activity: '고양이 돌봄 서비스 요청합니다',
      address: '서울 마포구 합정동',
      latitude: 37.5497,
      longitude: 126.9134,
      price: 50000,
      price_type: PriceType.daily,
      pets: {
        create: [
          { id: randomUUID(), name: '나비', age: 1, species: PetSpecies.Cat, breed: '페르시안', size: '소형' },
        ],
      },
    },
    include: { pets: true },
  });

  // job3: owner2 소유 | sitter2 approved | PetOwner(owner2)만 리뷰 작성 완료
  // 위치: 부산 해운대구 | 시급 20,000원
  const job3 = await prisma.job.create({
    data: {
      id: randomUUID(),
      creator_user_id: owner2.id,
      start_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      end_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      activity: '허스키 산책 도우미 구합니다',
      address: '부산 해운대구 우동',
      latitude: 35.1631,
      longitude: 129.1635,
      price: 20000,
      price_type: PriceType.hourly,
      pets: {
        create: [
          { id: randomUUID(), name: '멍멍이', age: 5, species: PetSpecies.Dog, breed: '시베리안 허스키', size: '대형' },
        ],
      },
    },
    include: { pets: true },
  });

  // job4: owner2 소유 | 지원자 없음 | 리뷰 불가 | 위치/가격 없음
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
  // 위치: 서울 신촌 | 시급 12,000원
  const job5 = await prisma.job.create({
    data: {
      id: randomUUID(),
      creator_user_id: both.id,
      start_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      end_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      activity: '소형견 산책 도우미 구합니다',
      address: '서울 서대문구 신촌동',
      latitude: 37.5596,
      longitude: 126.9423,
      price: 12000,
      price_type: PriceType.hourly,
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
  // 5. Favorites 생성
  // ──────────────────────────────────────────
  console.log('❤️  Favorites 생성 중...');

  const favorites = await Promise.all([
    // sitter1: job3(부산 허스키), job4(고양이 돌봄) 즐겨찾기
    prisma.favorite.create({ data: { id: randomUUID(), user_id: sitter1.id, job_id: job3.id } }),
    prisma.favorite.create({ data: { id: randomUUID(), user_id: sitter1.id, job_id: job4.id } }),
    // sitter2: job1(강남 산책), job5(신촌 소형견) 즐겨찾기
    prisma.favorite.create({ data: { id: randomUUID(), user_id: sitter2.id, job_id: job1.id } }),
    prisma.favorite.create({ data: { id: randomUUID(), user_id: sitter2.id, job_id: job5.id } }),
  ]);

  console.log(`✅ ${favorites.length}개의 즐겨찾기 생성 완료\n`);

  // ──────────────────────────────────────────
  // 6. ChatRooms + Messages 생성
  // ──────────────────────────────────────────
  console.log('💬 ChatRooms + Messages 생성 중...');

  // chatRoom1: job2 지원(applications[2]) — owner1 ↔ sitter1 | 메시지 5개 + 읽음처리 완료
  const chatRoom1 = await prisma.chatRoom.create({
    data: { id: randomUUID(), job_application_id: applications[2].id },
  });

  const chatRoom1Messages = [];
  const baseTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2시간 전부터
  const msgData1 = [
    { sender: owner1, content: '안녕하세요! 고양이 돌봄 지원해주셔서 감사합니다.' },
    { sender: sitter1, content: '안녕하세요! 고양이 돌봄 경험이 많아서 지원했습니다.' },
    { sender: owner1, content: '혹시 페르시안 종 돌봄 경험이 있으신가요?' },
    { sender: sitter1, content: '네, 페르시안 3마리를 돌본 경험이 있습니다. 털 관리도 가능해요!' },
    { sender: owner1, content: '좋습니다! 그러면 내일 오전 10시에 뵐 수 있을까요?' },
  ];

  for (let i = 0; i < msgData1.length; i++) {
    const msg = await prisma.message.create({
      data: {
        id: randomUUID(),
        content: msgData1[i].content,
        sender_id: msgData1[i].sender.id,
        chat_room_id: chatRoom1.id,
        createdAt: new Date(baseTime.getTime() + i * 5 * 60 * 1000), // 5분 간격
      },
    });
    chatRoom1Messages.push(msg);
  }

  // chatRoom1 읽음처리: 양측 모두 읽음
  const lastMsg1Time = chatRoom1Messages[chatRoom1Messages.length - 1].createdAt;
  await Promise.all([
    prisma.chatRoomRead.create({
      data: { id: randomUUID(), chat_room_id: chatRoom1.id, user_id: owner1.id, last_read_at: lastMsg1Time },
    }),
    prisma.chatRoomRead.create({
      data: { id: randomUUID(), chat_room_id: chatRoom1.id, user_id: sitter1.id, last_read_at: lastMsg1Time },
    }),
  ]);

  // chatRoom2: job3 지원(applications[3]) — owner2 ↔ sitter2 | 메시지 3개 + sitter2 안읽은 메시지 1개
  const chatRoom2 = await prisma.chatRoom.create({
    data: { id: randomUUID(), job_application_id: applications[3].id },
  });

  const chatRoom2Messages = [];
  const baseTime2 = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1시간 전부터
  const msgData2 = [
    { sender: sitter2, content: '허스키 산책 지원합니다! 대형견 산책 경험 풍부합니다.' },
    { sender: owner2, content: '반갑습니다. 혹시 해운대 근처 거주하시나요?' },
    { sender: sitter2, content: '네, 해운대구 거주 중입니다. 매일 산책 가능합니다.' },
  ];

  for (let i = 0; i < msgData2.length; i++) {
    const msg = await prisma.message.create({
      data: {
        id: randomUUID(),
        content: msgData2[i].content,
        sender_id: msgData2[i].sender.id,
        chat_room_id: chatRoom2.id,
        createdAt: new Date(baseTime2.getTime() + i * 3 * 60 * 1000), // 3분 간격
      },
    });
    chatRoom2Messages.push(msg);
  }

  // chatRoom2 읽음처리: owner2는 2번째 메시지까지만 읽음 (sitter2의 마지막 메시지 안읽음 = 1표시)
  await Promise.all([
    prisma.chatRoomRead.create({
      data: { id: randomUUID(), chat_room_id: chatRoom2.id, user_id: owner2.id, last_read_at: chatRoom2Messages[1].createdAt },
    }),
    prisma.chatRoomRead.create({
      data: { id: randomUUID(), chat_room_id: chatRoom2.id, user_id: sitter2.id, last_read_at: chatRoom2Messages[2].createdAt },
    }),
  ]);

  // chatRoom3: job5 지원(applications[5]) — both ↔ sitter1 | 채팅방만 생성 (메시지 없음, WebSocket 테스트용)
  const chatRoom3 = await prisma.chatRoom.create({
    data: { id: randomUUID(), job_application_id: applications[5].id },
  });

  const chatRooms = [chatRoom1, chatRoom2, chatRoom3];
  const totalMessages = chatRoom1Messages.length + chatRoom2Messages.length;
  console.log(`✅ ${chatRooms.length}개의 채팅방, ${totalMessages}개의 메시지 생성 완료\n`);

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
  console.log(`   Favorites:       ${favorites.length}개`);
  console.log(`   ChatRooms:       ${chatRooms.length}개`);
  console.log(`   Messages:        ${totalMessages}개`);
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
  console.log('');
  console.log('📋 위치/가격 데이터 요약');
  console.log('───────────────────────────────────────────');
  console.log('   [job1] 서울 강남구 역삼동 | 15,000원/시간 (hourly)');
  console.log('   [job2] 서울 마포구 합정동 | 50,000원/일  (daily)');
  console.log('   [job3] 부산 해운대구 우동 | 20,000원/시간 (hourly)');
  console.log('   [job4] 위치/가격 없음 (null)');
  console.log('   [job5] 서울 신촌동       | 12,000원/시간 (hourly)');
  console.log('');
  console.log('❤️  즐겨찾기 현황');
  console.log('───────────────────────────────────────────');
  console.log('   sitter1(박돌봄): job3(허스키), job4(고양이 돌봄) 즐겨찾기');
  console.log('   sitter2(최돌봄): job1(강남 산책), job5(신촌 소형견) 즐겨찾기');
  console.log('   → toggleFavorite 테스트: job3을 sitter1으로 다시 누르면 제거됨');
  console.log('');
  console.log('💬 채팅 기능 테스트 시나리오');
  console.log('───────────────────────────────────────────');
  console.log('   [chatRoom1] job2 기반 — owner1(김주인) ↔ sitter1(박돌봄)');
  console.log('              메시지 5개, 양측 모두 읽음 완료');
  console.log('              → REST: GET /chat-rooms 으로 목록 확인 (unreadCount=0)');
  console.log('              → REST: GET /chat-rooms/:id/messages 로 히스토리 확인');
  console.log('');
  console.log('   [chatRoom2] job3 기반 — owner2(이주인) ↔ sitter2(최돌봄)');
  console.log('              메시지 3개, owner2 안읽은 메시지 1개');
  console.log('              → owner2 로그인 시 unreadCount=1 확인');
  console.log('              → sitter2 로그인 시 unreadCount=0 확인');
  console.log('');
  console.log('   [chatRoom3] job5 기반 — both(양면인) ↔ sitter1(박돌봄)');
  console.log('              메시지 없음 (WebSocket sendMessage 테스트용)');
  console.log('              → Socket.io 연결 후 joinRoom/sendMessage 테스트');
  console.log('');
  console.log('   WebSocket 연결: ws://localhost:3000/chat');
  console.log('   auth: { token: "JWT토큰" }');
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
