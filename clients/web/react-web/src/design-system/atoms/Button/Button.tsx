import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Spinner } from '../Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** true일 때 버튼이 비활성화되고 Spinner가 표시됩니다. */
  isLoading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:brightness-110',
  secondary: 'bg-background text-text-primary hover:brightness-95',
  danger: 'bg-danger text-white hover:brightness-90',
  ghost: 'bg-transparent text-text-primary hover:bg-background border border-grey200',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-12 py-8 text-b2 rounded-lg',
  md: 'px-16 py-12 text-b1 rounded-xl',
  lg: 'px-24 py-16 text-t2 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-bold transition-all',
        'active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-8">
          <Spinner size={16} color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} />
          로딩 중...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
