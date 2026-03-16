import type { ComponentType } from 'react';

import { ConfirmModal } from './ConfirmModal';
import type { ConfirmModalProps } from './ConfirmModal';

/**
 * ModalRegistry — 모달 ID 와 props 타입의 단일 진실 공급원 (SSOT)
 *
 * 새 모달을 추가하는 방법:
 *   1. src/components/modals/YourModal.tsx 생성
 *   2. 아래 ModalRegistry 에 항목 추가:
 *        'your-modal': Omit<YourModalProps, 'onClose'>;
 *   3. 아래 MODAL_COMPONENTS 에 컴포넌트 추가:
 *        'your-modal': YourModal,
 *
 * ──────────────────────────────────────────────────────────────────
 *
 * [타입 안전성 보장 방식]
 * - open('confirm', props) 에서 props 타입이 맞지 않으면 컴파일 오류 발생
 * - 존재하지 않는 id('unknown')를 사용하면 컴파일 오류 발생
 *
 * [리렌더링 방지]
 * - open / close 액션만 셀렉터로 구독 → 모달 목록 변화에 무반응
 * - GlobalModal 만 modals 배열 전체를 구독
 */
export type ModalRegistry = {
  /** 확인/취소 다이얼로그 */
  confirm: Omit<ConfirmModalProps, 'onClose'>;
  // 추후 추가 예시:
  // alert:   Omit<AlertModalProps,   'onClose'>;
  // 'image-viewer': Omit<ImageViewerProps, 'onClose'>;
};

/**
 * 각 모달 ID에 대응하는 컴포넌트 타입 (ModalRegistry[K] + onClose?)
 *
 * 이 타입을 사용하면 컴포넌트가 ModalRegistry에 등록된 props를 정확히 수용하는지
 * 컴파일 타임에 검증됩니다.
 */
type ModalComponents = {
  [K in keyof ModalRegistry]: ComponentType<ModalRegistry[K] & { onClose?: () => void }>;
};

/**
 * 모달 ID → 컴포넌트 맵
 *
 * 새 모달을 ModalRegistry 에 추가했는데 여기에 안 넣으면 컴파일 오류 발생.
 */
export const MODAL_COMPONENTS: ModalComponents = {
  confirm: ConfirmModal,
};
