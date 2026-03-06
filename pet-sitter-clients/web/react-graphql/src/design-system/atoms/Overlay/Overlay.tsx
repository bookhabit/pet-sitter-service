import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../../utils/cn';

interface OverlayProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  /** 배경 클릭 시 닫기 (default: true) */
  closeOnOverlayClick?: boolean;
  /** ESC 키 닫기 (default: true) */
  closeOnEsc?: boolean;
  /** 모달 컨테이너 추가 클래스 */
  className?: string;
}

export function Overlay({
  isOpen,
  onClose,
  children,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className,
}: OverlayProps) {
  /* ── ESC 키 핸들러 ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen || !closeOnEsc || !onClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  /* ── 배경 스크롤 잠금 ──────────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    /* 배경 (Backdrop) */
    <div
      className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="presentation"
    >
      {/* 모달 컨테이너 — 클릭 버블링 차단 */}
      <div
        className={cn('animate-modal-in relative', className)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
