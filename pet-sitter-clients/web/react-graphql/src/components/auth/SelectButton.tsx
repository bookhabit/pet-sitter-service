import type { ReactNode } from 'react';

import { cn } from '@/design-system';

interface SelectButtonProps {
  isSelected: boolean;
  onClick: () => void;
  icon?: ReactNode;
  label: string;
  description?: string;
  className?: string;
}

export function SelectButton({
  isSelected,
  onClick,
  icon,
  label,
  description,
  className,
}: SelectButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 rounded-xl border-2 transition-all',
        description
          ? 'flex-col items-center gap-4 px-16 py-16'
          : 'items-center justify-center gap-8 py-12 text-b2 font-bold',
        isSelected
          ? 'border-primary bg-blue-50 text-primary'
          : 'hover:border-primary/40 border-grey200 bg-background text-text-secondary',
        className,
      )}
    >
      {icon && (
        <span aria-hidden="true" className="flex-shrink-0">
          {icon}
        </span>
      )}
      {description ? (
        <>
          <span className="text-b2 font-medium text-text-primary">{label}</span>
          <span className="text-caption font-medium text-text-secondary">{description}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
