import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 라벨 텍스트 */
  label?: string;
  /** 에러 메시지 — 전달 시 자동으로 에러 UI 적용 */
  error?: string;
  /** 도움말 텍스트 */
  hint?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label;

    return (
      <div className={cn('flex flex-col gap-8', className)}>
        {label && (
          <label htmlFor={inputId} className="text-b2 text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'rounded-xl border-2 bg-background px-16 py-12 text-b1 text-text-primary outline-none transition-all',
            'placeholder:text-text-secondary',
            error
              ? 'border-danger focus:border-danger'
              : 'border-transparent focus:border-primary focus:bg-white',
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
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
