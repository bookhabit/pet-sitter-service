'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { CheckIcon } from '../../icons';
import { cn } from '../../utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** 체크박스 옆에 표시할 라벨 텍스트 */
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, checked, className, ...props }, ref) => {
    return (
      <label className={cn('group inline-flex cursor-pointer items-center gap-12', className)}>
        {/* 커스텀 체크박스 UI */}
        <div
          className={cn(
            'flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all',
            checked
              ? 'border-primary bg-primary'
              : 'border-grey200 bg-white group-hover:border-primary',
          )}
        >
          {checked && <CheckIcon size={14} color="white" />}
        </div>

        {/* 실제 input (숨김) */}
        <input type="checkbox" ref={ref} checked={checked} className="hidden" {...props} />

        {label && <span className="text-b1 text-text-primary">{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
