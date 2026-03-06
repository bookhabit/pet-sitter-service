import { Badge, Button, Divider, Flex, Spacing, Text } from '@/design-system';
import { Image } from '@/design-system/atoms/Image/Image';
import { CalendarIcon, DollarSignIcon, HeartIcon, MapIcon } from '@/design-system/icons';

import type { Job } from '@/schemas/job.schema';
import type { ApproveStatus } from '@/schemas/job-application.schema';
import { formatJobDateTime, formatPrice } from '@/utils/format';

import { ApplyButton } from './ApplyButton';

interface Props {
  job: Job;
  isOwner: boolean;
  /** 현재 유저가 PetSitter 역할을 가지고 있는지 여부 */
  isPetSitter: boolean;
  /** PetSitter의 현재 지원 상태. null이면 미지원 */
  appliedStatus: ApproveStatus | null;
  /** PetSitter가 지원한 경우의 jobApplicationId — 메시지 보내기 버튼에 사용 */
  jobApplicationId: string | null;
  /** 지원 mutation 진행 중 */
  isApplying: boolean;
  /** 지원 mutation 에러 메시지 */
  applyErrorMessage: string | null;
  onApply: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onNavigateBack: () => void;
  /** PetOwner(작성자) 전용: 지원자 관리 페이지로 이동 */
  onNavigateToApplications: () => void;
  isDeleting: boolean;
  /** 이 공고가 현재 즐겨찾기 되어 있는지 여부 */
  isFavorited: boolean;
  /** 즐겨찾기 토글 mutation 진행 중 */
  isTogglingFavorite: boolean;
  /** PetSitter 전용: 즐겨찾기 토글 핸들러 */
  onToggleFavorite: () => void;
  /** PetSitter 전용: 메시지 보내기 핸들러 */
  onMessage: () => void;
}

/**
 * [View] 구인공고 상세 — 순수 UI 표현만 담당
 *
 * Figma 디자인 반영 (node 5:809):
 * - 상단 히어로 이미지 (job.photos[0] 또는 pet.photos[0])
 * - 공고 정보 카드: 제목, 위치·일정·가격 행, 상세 설명 섹션
 * - 반려동물 정보 카드: 원형 아바타 + 이름·품종·나이/체형
 * - 하단 액션 버튼 (역할별 분기 — 변경 금지)
 *
 * - isOwner === true  → "지원자 관리" 버튼 + 수정/삭제 버튼 표시
 * - isPetSitter && !isOwner → ApplyButton + HeartIcon 즐겨찾기 버튼 표시
 * - PetOwner이면서 공고 작성자가 아닌 경우 → 지원/관리 UI 미표시
 *
 * 미구현 — 구인자 정보 섹션:
 *   Figma에 "구인자 정보" 섹션이 존재하나, Job 스키마에 creator 상세 정보
 *   (이름, 아바타, 평점)가 포함되지 않아 현재 구현 불가.
 *   creator 데이터가 API/스키마에 추가되면 해당 섹션을 구현할 것.
 */
export function JobDetailView({
  job,
  isOwner,
  isPetSitter,
  appliedStatus,
  jobApplicationId,
  isApplying,
  applyErrorMessage,
  onApply,
  onDelete,
  onEdit,
  onNavigateBack,
  onNavigateToApplications,
  isDeleting,
  isFavorited,
  isTogglingFavorite,
  onToggleFavorite,
  onMessage,
}: Props) {
  console.log('isApplying:', isApplying);
  console.log('appliedStatus:', appliedStatus);
  // 대표 이미지: job.photos[0] 또는 첫 번째 pet photo
  const heroSrc = job.photos[0]?.url ?? job.pets[0]?.photos?.[0]?.url ?? undefined;

  const formattedPrice = formatPrice(job.price, job.price_type);

  return (
    <div className="min-h-screen bg-background">
      {/* 히어로 이미지 */}
      {heroSrc !== undefined && (
        <div className="h-[40rem] w-full overflow-hidden rounded-b-2xl">
          <Image src={heroSrc} alt={job.activity} className="h-full w-full" />
        </div>
      )}

      <div className="mx-auto max-w-[86rem] px-16 py-24">
        {/* 뒤로가기 버튼 */}
        <Button variant="ghost" size="sm" onClick={onNavigateBack}>
          ← 돌아가기
        </Button>

        <Spacing size={24} />

        {/* ── 공고 정보 카드 ──────────────────────────────── */}
        <section className="rounded-2xl bg-white p-24 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
          {/* 제목 행 + PetSitter 즐겨찾기 버튼 */}
          <Flex justify="between" align="start" gap={12}>
            <Text
              as="h1"
              size="t1"
              className="flex-1 font-bold leading-[3.2rem] tracking-[0.007rem]"
            >
              {job.activity}
            </Text>

            {/* PetSitter 전용 즐겨찾기 토글 버튼 */}
            {isPetSitter && (
              <button
                type="button"
                aria-label={isFavorited ? '즐겨찾기 제거' : '즐겨찾기 추가'}
                disabled={isTogglingFavorite}
                onClick={onToggleFavorite}
                className="shrink-0 rounded-full p-8 transition-colors hover:bg-grey100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <HeartIcon size={24} color={isFavorited ? 'var(--red500)' : 'var(--grey400)'} />
              </button>
            )}
          </Flex>

          <Spacing size={16} />

          {/* 메타 정보 행 (위치 · 일정 · 가격) */}
          <Flex direction="column" gap={12}>
            {/* 위치 */}
            {job.address !== null && (
              <Flex align="center" gap={12}>
                <div className="shrink-0">
                  <MapIcon size={20} color="var(--grey500)" />
                </div>
                <Text size="b1" color="secondary">
                  {job.address}
                </Text>
              </Flex>
            )}

            {/* 일정 */}
            <Flex align="start" gap={12}>
              <div className="mt-2 shrink-0">
                <CalendarIcon size={20} color="var(--grey500)" />
              </div>
              <Flex direction="column" gap={4}>
                <Text size="b1" color="secondary">
                  {formatJobDateTime(job.start_time, job.end_time)}
                </Text>
                <Text size="b2" color="secondary">
                  등록일:{' '}
                  {new Intl.DateTimeFormat('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }).format(job.createdAt)}
                </Text>
              </Flex>
            </Flex>

            {/* 가격 */}
            {formattedPrice !== null && (
              <Flex align="center" gap={12}>
                <div className="shrink-0">
                  <DollarSignIcon size={20} color="var(--grey500)" />
                </div>
                <Text size="b1" color="secondary">
                  {formattedPrice}
                </Text>
              </Flex>
            )}
          </Flex>

          {/* 상세 설명 섹션 */}
          <div className="mt-24 border-t border-grey200 pt-24">
            <Text as="h2" size="t2" className="font-semibold leading-[2.8rem] tracking-[-0.044rem]">
              상세 설명
            </Text>
            <Spacing size={12} />
            <Text size="b1" color="secondary" className="whitespace-pre-wrap break-words">
              {job.activity}
            </Text>
          </div>
        </section>

        <Spacing size={24} />

        {/* ── 반려동물 정보 카드 ──────────────────────────── */}
        <section className="rounded-2xl bg-white p-24 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
          <Text as="h2" size="t2" className="font-semibold leading-[2.8rem] tracking-[-0.044rem]">
            반려동물 정보
          </Text>

          <Spacing size={16} />

          <div className="grid grid-cols-1 gap-16 sm:grid-cols-2">
            {job.pets.map((pet) => {
              const petAvatarSrc = pet.photos?.[0]?.url ?? undefined;
              const speciesLabel = pet.species === 'Dog' ? '강아지' : '고양이';

              return (
                <div key={pet.id} className="flex gap-16 rounded-xl bg-background p-16">
                  {/* 원형 아바타 */}
                  <div className="h-[6.4rem] w-[6.4rem] shrink-0 overflow-hidden rounded-full">
                    <Image src={petAvatarSrc} alt={`${pet.name} 사진`} className="h-full w-full" />
                  </div>

                  {/* 반려동물 정보 */}
                  <Flex direction="column" gap={4} className="min-w-0 flex-1">
                    <Flex align="center" gap={8}>
                      <Text
                        as="h3"
                        size="t2"
                        className="font-semibold leading-[2.7rem] tracking-[-0.044rem]"
                      >
                        {pet.name}
                      </Text>
                      <Badge variant="neutral" size="sm">
                        {speciesLabel}
                      </Badge>
                    </Flex>

                    <Text size="b2" color="secondary">
                      {pet.breed}
                    </Text>

                    <Text size="b2" color="secondary">
                      {pet.age}살{pet.size !== null ? ` · ${pet.size}` : ''}
                    </Text>
                  </Flex>
                </div>
              );
            })}
          </div>
        </section>

        {/* 공고 사진 (있을 경우) */}
        {job.photos.length > 0 && (
          <>
            <Spacing size={24} />
            <section className="rounded-2xl bg-white p-24 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
              <Text
                as="h2"
                size="t2"
                className="font-semibold leading-[2.8rem] tracking-[-0.044rem]"
              >
                공고 사진
              </Text>
              <Spacing size={16} />
              <Flex gap={8} wrap>
                {job.photos.map((photo) => (
                  <div key={photo.id} className="h-[12rem] w-[12rem] overflow-hidden rounded-xl">
                    <Image src={photo.url} alt="공고 사진" className="h-full w-full" />
                  </div>
                ))}
              </Flex>
            </section>
          </>
        )}

        {/* ── 하단 액션 영역 (역할별 분기 — 변경 금지) ──── */}

        {/* PetSitter 전용: 지원하기 버튼 (작성자는 본인 공고에 지원 불가) */}
        {isPetSitter && !isOwner && (
          <>
            <Spacing size={32} />
            <Divider />
            <Spacing size={24} />
            <ApplyButton
              appliedStatus={appliedStatus}
              isApplying={isApplying}
              errorMessage={applyErrorMessage}
              onApply={onApply}
            />
            {/* 지원한 경우에만 메시지 보내기 버튼 표시 */}
            {appliedStatus !== null && jobApplicationId !== null && (
              <>
                <Spacing size={12} />
                <Button variant="ghost" size="md" onClick={onMessage} className="w-full">
                  메시지 보내기
                </Button>
              </>
            )}
          </>
        )}

        {/* PetOwner(작성자) 전용: 지원자 관리 페이지 이동 버튼 */}
        {isOwner && (
          <>
            <Spacing size={32} />
            <Divider />
            <Spacing size={24} />
            <Button
              variant="secondary"
              size="md"
              onClick={onNavigateToApplications}
              className="w-full"
            >
              지원자 관리
            </Button>
          </>
        )}

        {/* 작성자 전용: 수정 / 삭제 버튼 */}
        {isOwner && (
          <>
            <Spacing size={12} />
            <Flex gap={12}>
              <Button variant="secondary" size="md" onClick={onEdit} className="flex-1">
                수정
              </Button>
              <Button
                variant="danger"
                size="md"
                isLoading={isDeleting}
                onClick={onDelete}
                className="flex-1"
              >
                삭제
              </Button>
            </Flex>
          </>
        )}
      </div>
    </div>
  );
}
