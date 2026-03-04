export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatPrice(price: number | null, priceType: string | null): string | null {
  if (!price) return null;
  const formatted = new Intl.NumberFormat('ko-KR').format(price);
  const unit = priceType === 'hourly' ? '시간' : '일';
  return `${formatted}원 / ${unit}`;
}
