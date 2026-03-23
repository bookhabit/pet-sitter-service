import { useNavigate } from 'react-router-dom';

import { Badge, Button, Flex, Spacing, Text } from '@/design-system';
import { HeartIcon } from '@/design-system/icons';

import type { Job } from '@/schemas/job.schema';
import { formatDateTime, formatPrice } from '@/utils/format';

interface Props {
  favorites: Job[];
  /** 제거 mutation 진행 중인 jobId. null이면 없음 */
  removingId: string | null;
  onRemove: (jobId: string) => void;
}

/**
 * [View] 즐겨찾기 목록 — 순수 UI 표현만 담당
 *
 * 빈 배열 처리는 호출부(Container)의 EmptyBoundary에서 담당합니다.
 */
export function FavoritesSection({ favorites, removingId, onRemove }: Props) {
  const navigate = useNavigate();

  return (
    <section>
      <Text as="h2" size="t2" className="font-bold">
        즐겨찾기 목록 ({favorites.length}개)
      </Text>

      <Spacing size={16} />

      <Flex direction="column" gap={12} as="ul">
        {favorites.map((job) => {
          const isRemoving = removingId === job.id;
          const priceLabel = formatPrice(job.price, job.price_type);

          return (
            <li key={job.id} className="rounded-2xl border border-grey200 bg-white p-16">
              <Flex justify="between" align="start" gap={12}>
                {/* 공고 정보 — 클릭 시 상세 페이지 이동 */}
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
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

                  <Spacing size={4} />

                  <Text size="b2" color="secondary">
                    {formatDateTime(job.start_time)} ~ {formatDateTime(job.end_time)}
                  </Text>

                  {job.address && (
                    <>
                      <Spacing size={4} />
                      <Text size="b2" color="secondary">
                        📍 {job.address}
                      </Text>
                    </>
                  )}
                </button>

                {/* 즐겨찾기 제거 버튼 */}
                <button
                  type="button"
                  aria-label="즐겨찾기 제거"
                  disabled={isRemoving}
                  onClick={() => onRemove(job.id)}
                  className="shrink-0 rounded-full p-8 transition-colors hover:bg-grey100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <HeartIcon size={20} color="var(--red500)" />
                </button>
              </Flex>
            </li>
          );
        })}
      </Flex>
    </section>
  );
}
