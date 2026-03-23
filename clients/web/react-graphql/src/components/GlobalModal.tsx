import { Overlay } from '@/design-system';

import { MODAL_COMPONENTS } from './modals/registry';
import type { ModalRegistry } from './modals/registry';
import { useModalStore } from '@/store/useModalStore';

/**
 * 전역 모달 렌더러
 *
 * App.tsx 최상단에 한 번만 마운트합니다.
 * useModalStore 의 modals 배열을 구독하여 열려 있는 모달을 순서대로 렌더링합니다.
 *
 * 리렌더링 범위:
 * - GlobalModal 자체는 modals 배열 변화 시 리렌더링됨 (의도된 동작)
 * - 모달을 '여는' 다른 컴포넌트는 open 액션만 셀렉터로 구독하므로 리렌더링 없음
 */
export function GlobalModal() {
  const modals = useModalStore((state) => state.modals);
  const close = useModalStore((state) => state.close);

  return (
    <>
      {modals.map((entry) => {
        const onClose = () => close(entry.id);
        return (
          <Overlay key={entry.id} isOpen onClose={onClose}>
            {renderModalContent(entry, onClose)}
          </Overlay>
        );
      })}
    </>
  );
}

/**
 * discriminated union 을 id 로 좁혀 타입 안전하게 컴포넌트를 렌더링합니다.
 *
 * 일반 함수로 분리하면 TypeScript 가 각 K 에 대해
 * MODAL_COMPONENTS[K] 와 entry.props 의 타입 일치를 추론할 수 있습니다.
 */
function renderModalContent<K extends keyof ModalRegistry>(
  entry: { id: K; props: ModalRegistry[K] },
  onClose: () => void,
) {
  const Component = MODAL_COMPONENTS[entry.id] as React.ComponentType<
    ModalRegistry[K] & { onClose: () => void }
  >;
  return <Component {...entry.props} onClose={onClose} />;
}
