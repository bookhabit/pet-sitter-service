import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/cn';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 라벨 텍스트 */
  label?: string;
  /** 에러 메시지 — 전달 시 자동으로 에러 UI 적용 */
  error?: string;
  /** 도움말 텍스트 */
  hint?: string;
  /** 입력 필드 왼쪽 아이콘 */
  leftIcon?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label;

    return (
      <div className={cn('flex flex-col gap-8', className)}>
        {label && (
          <label htmlFor={inputId} className="text-b2 text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 text-text-secondary"
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl border bg-white py-12 text-b1 text-text-primary outline-none transition-all',
              'placeholder:text-text-secondary',
              leftIcon ? 'pl-48 pr-16' : 'px-16',
              error ? 'border-danger focus:border-danger' : 'border-grey200 focus:border-primary',
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
        {error && (
          <span id={`${inputId}-error`} className="text-caption text-danger" role="alert">
            {error}
          </span>
        )}
        {!error && hint && (
          <span id={`${inputId}-hint`} className="text-caption text-text-secondary">
            {hint}
          </span>
        )}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
