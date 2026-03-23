'use client';

import { Button } from '@/design-system';
import { Flex } from '@/design-system';
import { Spacing } from '@/design-system';
import { Text } from '@/design-system';

export interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  /** 확인 버튼 텍스트 (default: '확인') */
  confirmLabel?: string;
  /** 취소 버튼 텍스트 (default: '취소') */
  cancelLabel?: string;
  /** 확인 버튼 스타일 (default: 'primary') */
  variant?: 'primary' | 'danger';
  /** GlobalModal 이 주입 — 호출 측에서 직접 넘기지 않아도 됩니다 */
  onClose?: () => void;
}

export function ConfirmModal({
  title,
  message,
  onConfirm,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'primary',
  onClose,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose?.();
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '1.6rem',
        padding: '3.2rem',
        width: '40rem',
        maxWidth: 'calc(100vw - 3.2rem)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}
    >
      {/* 제목 */}
      <Text size="t2" as="h2">
        {title}
      </Text>

      <Spacing size={12} />

      {/* 메시지 */}
      <Text size="b1" color="secondary">
        {message}
      </Text>

      <Spacing size={32} />

      {/* 버튼 영역 */}
      <Flex gap={12} justify="end">
        <Button variant="ghost" size="md" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} size="md" onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </Flex>
    </div>
  );
}
