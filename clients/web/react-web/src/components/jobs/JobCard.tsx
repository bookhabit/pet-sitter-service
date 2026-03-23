import { useNavigate } from 'react-router-dom';

import { Flex, Spacing, Text } from '@/design-system';
import { CalendarIcon, HeartIcon, MapIcon } from '@/design-system/icons';
import { Image } from '@/design-system/atoms/Image/Image';

import type { Job } from '@/schemas/job.schema';
import { formatJobDateTime } from '@/utils/format';

interface Props {
  job: Job;
  /** 현재 유저가 PetSitter 역할을 가지고 있는지 여부 */
  isPetSitter: boolean;
  /** 이 공고가 현재 즐겨찾기 되어 있는지 여부 */
  isFavorited: boolean;
  /** 즐겨찾기 토글 핸들러 */
  onToggleFavorite: (jobId: string) => void;
}

/**
 * [View] 구인공고 카드 — 순수 UI 표현만 담당
 *
 * Figma 디자인 반영:
 * - 상단 이미지 썸네일 (234px 고정 높이)
 * - 카드: rounded-2xl, shadow-sm, white bg
 * - 제목(18px semibold) + 가격(primary bold) 헤더 행
 * - 위치/날짜 메타 행 (16px 아이콘 + caption 텍스트)
 * - 펫 이름·품종 필 뱃지 (bg-background, full radius)
 */
export function JobCard({ job, isPetSitter, isFavorited, onToggleFavorite }: Props) {
  const navigate = useNavigate();

  const priceAmount = job.price !== null ? new Intl.NumberFormat('ko-KR').format(job.price) : null;

  const priceUnit =
    job.price_type === 'hourly' ? '시간당' : job.price_type === 'daily' ? '일당' : null;

  // 대표 이미지: job.photos[0] 또는 첫 번째 pet photo
  const thumbnailSrc = job.photos[0]?.url ?? job.pets[0]?.photos?.[0]?.url ?? undefined;

  const handleCardClick = () => navigate(`/jobs/${job.id}`);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') navigate(`/jobs/${job.id}`);
  };
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(job.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] active:scale-[0.99]"
    >
      {/* 이미지 영역 */}
      <div className="relative h-[23.4rem] w-full shrink-0">
        <Image src={thumbnailSrc} alt={job.activity} className="h-full w-full" />

        {/* PetSitter 전용 즐겨찾기 버튼 — 이미지 우상단 오버레이 */}
        {isPetSitter && (
          <button
            type="button"
            aria-label={isFavorited ? '즐겨찾기 제거' : '즐겨찾기 추가'}
            onClick={handleToggleFavorite}
            className="absolute right-12 top-12 flex items-center justify-center rounded-full bg-white/90 p-8 transition-colors hover:bg-white"
          >
            <HeartIcon size={20} color={isFavorited ? 'var(--red500)' : 'var(--grey600)'} />
          </button>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-16">
        {/* 제목 + 가격 행 */}
        <Flex justify="between" align="start" gap={8}>
          <Text
            as="h3"
            size="b1"
            className="line-clamp-1 flex-1 text-[1.8rem] font-semibold leading-[2.8rem] tracking-[-0.04rem] text-text-primary"
          >
            {job.activity}
          </Text>

          {priceAmount !== null && priceUnit !== null && (
            <div className="shrink-0 text-right">
              <p className="text-[1.8rem] font-bold leading-[2.8rem] tracking-[-0.04rem] text-primary">
                ₩{priceAmount}
              </p>
              <p className="text-caption text-text-secondary">{priceUnit}</p>
            </div>
          )}
        </Flex>

        <Spacing size={8} />

        {/* 메타 정보 행들 */}
        <div className="flex flex-col gap-8">
          {/* 위치 */}
          {job.address && (
            <Flex align="center" gap={8}>
              <MapIcon size={16} color="var(--grey600)" />
              <Text size="b2" color="secondary" className="line-clamp-1">
                {job.address}
              </Text>
            </Flex>
          )}

          {/* 날짜/시간 */}
          <Flex align="center" gap={8}>
            <CalendarIcon size={16} color="var(--grey600)" />
            <Text size="b2" color="secondary">
              {formatJobDateTime(job.start_time, job.end_time)}
            </Text>
          </Flex>
        </div>

        {/* 펫 뱃지 */}
        {job.pets.length > 0 && (
          <>
            <Spacing size={12} />
            <Flex gap={8} wrap>
              {job.pets.map((pet) => (
                <span
                  key={pet.id}
                  className="inline-flex items-center gap-4 rounded-full bg-background px-8 py-4"
                >
                  <Text as="span" size="caption" className="font-medium text-text-primary">
                    {pet.name}
                  </Text>
                  <Text as="span" size="caption" color="secondary">
                    · {pet.breed}
                  </Text>
                </span>
              ))}
            </Flex>
          </>
        )}
      </div>
    </div>
  );
}
