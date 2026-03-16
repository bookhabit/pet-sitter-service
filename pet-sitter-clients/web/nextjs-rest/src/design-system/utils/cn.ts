import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind 클래스를 안전하게 병합합니다.
 * - clsx: 조건부 클래스 처리
 * - twMerge: 충돌하는 Tailwind 클래스 자동 해소
 *
 * @example
 * cn('px-16 py-8', isActive && 'bg-primary', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
