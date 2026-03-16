'use client';

interface Props<T> {
  data: T[] | null | undefined;
  fallback: React.ReactNode;
  children: React.ReactNode;
}

export function EmptyBoundary<T>({ data, fallback, children }: Props<T>) {
  // 데이터가 없거나 배열의 길이가 0인 경우 fallback(비어있음 UI) 렌더링
  if (!data || data.length === 0) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
