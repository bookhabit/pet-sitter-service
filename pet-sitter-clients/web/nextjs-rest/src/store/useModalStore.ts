import { create } from 'zustand';

import type { ModalRegistry } from '@/components/modals/registry';

/**
 * 열려 있는 모달 하나를 표현하는 discriminated union 타입.
 *
 * { id: 'confirm', props: ConfirmModalProps }
 * { id: 'alert',   props: AlertModalProps   }  ← 추후 추가
 *
 * 이 형태 덕분에 GlobalModal 렌더러에서 id 로 좁히면
 * TypeScript 가 props 타입을 자동으로 추론합니다.
 */
type ModalEntry = {
  [K in keyof ModalRegistry]: { id: K; props: ModalRegistry[K] };
}[keyof ModalRegistry];

interface ModalState {
  modals: ModalEntry[];

  /**
   * 모달 열기
   *
   * @example
   * const open = useModalStore(state => state.open);
   * open('confirm', { title: '삭제', message: '...', onConfirm: handleDelete });
   *
   * @template K  ModalRegistry 의 키 — 존재하지 않는 id 는 컴파일 오류
   */
  open: <K extends keyof ModalRegistry>(id: K, props: ModalRegistry[K]) => void;

  /** 특정 모달 닫기 */
  close: (id: keyof ModalRegistry) => void;

  /** 모든 모달 닫기 */
  closeAll: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modals: [],

  open: (id, props) =>
    set((state) => {
      // 같은 id 가 이미 열려 있으면 props 만 갱신 (중복 방지)
      const exists = state.modals.some((m) => m.id === id);
      if (exists) {
        return {
          modals: state.modals.map((m) =>
            m.id === id ? ({ id, props } as ModalEntry) : m,
          ),
        };
      }
      return { modals: [...state.modals, { id, props } as ModalEntry] };
    }),

  close: (id) =>
    set((state) => ({
      modals: state.modals.filter((m) => m.id !== id),
    })),

  closeAll: () => set({ modals: [] }),
}));

/* ── 편의 셀렉터 훅 ────────────────────────────────────────────────
 *
 * 컴포넌트에서 전체 store 를 구독하지 않고 필요한 액션만 가져옵니다.
 * Zustand 의 액션 함수는 stable reference 이므로 리렌더링이 발생하지 않습니다.
 *
 * 사용 예시:
 *   const openModal  = useOpenModal();
 *   const closeModal = useCloseModal();
 *
 * 또는 직접 셀렉터 사용:
 *   const open = useModalStore(state => state.open);
 * ────────────────────────────────────────────────────────────────── */

/** 모달을 여는 액션만 구독 — 모달 목록 변화에 무반응 */
export const useOpenModal = () => useModalStore((state) => state.open);

/** 모달을 닫는 액션만 구독 — 모달 목록 변화에 무반응 */
export const useCloseModal = () => useModalStore((state) => state.close);

/** 모든 모달을 닫는 액션만 구독 */
export const useCloseAllModals = () => useModalStore((state) => state.closeAll);
