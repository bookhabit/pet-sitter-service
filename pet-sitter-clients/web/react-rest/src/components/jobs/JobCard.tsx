import { useNavigate } from 'react-router-dom';

import { Badge, Flex, Spacing, Text } from '@/design-system';

import type { Job } from '@/schemas/job.schema';

interface Props {
  job: Job;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatPrice(price: number | null, priceType: string | null): string | null {
  if (!price) return null;
  const formatted = new Intl.NumberFormat('ko-KR').format(price);
  const unit = priceType === 'hourly' ? '시간' : '일';
  return `${formatted}원 / ${unit}`;
}

/**
 * [View] 구인공고 카드 — 순수 UI 표현만 담당
 */
export function JobCard({ job }: Props) {
  const navigate = useNavigate();

  // 펫 종류별 수량 집계
  const speciesCounts = job.pets.reduce<Record<string, number>>((acc, pet) => {
    acc[pet.species] = (acc[pet.species] ?? 0) + 1;
    return acc;
  }, {});

  const priceLabel = formatPrice(job.price, job.price_type);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/jobs/${job.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/jobs/${job.id}`)}
      className="cursor-pointer rounded-2xl border border-grey200 bg-white p-16 transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
    >
      {/* 제목 + 가격 */}
      <Flex justify="between" align="start" gap={12}>
        <Text as="h3" size="b1" className="line-clamp-2 flex-1 font-bold">
          {job.activity}
        </Text>
        {priceLabel && (
          <Badge variant="primary" size="sm" className="shrink-0">
            {priceLabel}
          </Badge>
        )}
      </Flex>

      <Spacing size={8} />

      {/* 날짜 */}
      <Text size="b2" color="secondary">
        {formatDate(job.start_time)} ~ {formatDate(job.end_time)}
      </Text>

      {/* 위치 */}
      {job.address && (
        <>
          <Spacing size={4} />
          <Text size="b2" color="secondary">
            📍 {job.address}
          </Text>
        </>
      )}

      {/* 펫 뱃지 */}
      {job.pets.length > 0 && (
        <>
          <Spacing size={12} />
          <Flex gap={8} wrap>
            {Object.entries(speciesCounts).map(([species, count]) => (
              <Badge key={species} variant="neutral" size="sm">
                {species === 'Dog' ? '🐶' : '🐱'} {count}마리
              </Badge>
            ))}
            {job.pets.map((pet) => (
              <Badge key={pet.id} variant="neutral" size="sm">
                {pet.name} ({pet.breed})
              </Badge>
            ))}
          </Flex>
        </>
      )}
    </div>
  );
}
