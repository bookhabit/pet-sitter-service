'use client';

import { useState } from 'react';

import { useMyFavoritesQuery, useRemoveFavoriteMutation } from '@/hooks/favorites';
import { useOpenModal } from '@/store/useModalStore';
import { EmptyBoundary } from '@/components/common/globalException/boundary';

import { FavoritesSection } from './FavoritesSection';
import { FavoritesEmptyView } from './exception/FavoritesEmptyView';

/**
 * [Container] 즐겨찾기 목록 데이터 + 제거 로직 (PetSitter 전용)
 *
 * 책임:
 *   - useMyFavoritesQuery 호출 → 즐겨찾기 목록 확보
 *   - useRemoveFavoriteMutation 호출 → 즐겨찾기 제거 mutation
 *   - 제거 클릭 시 확인 모달 오픈 → 확인 시 mutation 실행
 *   - FavoritesSection에 데이터 + 핸들러 전달
 *
 * useSuspenseQuery를 사용하므로 반드시 Suspense + QueryErrorBoundary 안에서 렌더링됩니다.
 */
export function FavoritesContainer() {
  const openModal = useOpenModal();

  const { data: favorites } = useMyFavoritesQuery();
  const { mutate: removeFavorite, isPending } = useRemoveFavoriteMutation();

  // 제거 진행 중인 jobId — 개별 버튼 비활성화에 사용
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemoveClick = (jobId: string) => {
    openModal('confirm', {
      title: '즐겨찾기 제거',
      message: '즐겨찾기에서 제거하시겠습니까?',
      confirmLabel: '제거',
      cancelLabel: '취소',
      variant: 'danger',
      onConfirm: () => {
        setRemovingId(jobId);
        removeFavorite(jobId, {
          onSettled: () => setRemovingId(null),
        });
      },
    });
  };

  return (
    <EmptyBoundary data={favorites} fallback={<FavoritesEmptyView />}>
      <FavoritesSection
        favorites={favorites}
        removingId={isPending ? removingId : null}
        onRemove={handleRemoveClick}
      />
    </EmptyBoundary>
  );
}
