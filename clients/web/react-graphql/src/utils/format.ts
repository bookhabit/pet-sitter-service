export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatPrice(price: number | null, priceType: string | null): string | null {
  if (!price) return null;
  const formatted = new Intl.NumberFormat('ko-KR').format(price);
  const unit = priceType === 'hourly' ? '시간' : '일';
  return `${formatted}원 / ${unit}`;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const;

/**
 * Figma 카드 디자인 날짜 포맷: "2월 25일 (수) 09:00 - 18:00"
 * 시작~종료가 동일 날짜면 날짜 한 번만, 다르면 "M월 D일 ~ M월 D일" 형식
 */
export function formatJobDateTime(startDate: Date | string, endDate: Date | string): string {
  // GraphQL DateTime scalar은 문자열로 반환되므로 Date 변환
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = start.getMonth() + 1;
  const startDay = start.getDate();
  const startDayName = DAY_NAMES[start.getDay()];
  const startHour = String(start.getHours()).padStart(2, '0');
  const startMin = String(start.getMinutes()).padStart(2, '0');
  const endHour = String(end.getHours()).padStart(2, '0');
  const endMin = String(end.getMinutes()).padStart(2, '0');

  const isSameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (isSameDay) {
    return `${startMonth}월 ${startDay}일 (${startDayName}) ${startHour}:${startMin} - ${endHour}:${endMin}`;
  }

  const endMonth = end.getMonth() + 1;
  const endDay = end.getDate();
  const endDayName = DAY_NAMES[end.getDay()];
  return `${startMonth}월 ${startDay}일 (${startDayName}) ${startHour}:${startMin} ~ ${endMonth}월 ${endDay}일 (${endDayName}) ${endHour}:${endMin}`;
}
