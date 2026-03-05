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

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const;

/**
 * Figma 카드 디자인 날짜 포맷: "2월 25일 (수) 09:00 - 18:00"
 * 시작~종료가 동일 날짜면 날짜 한 번만, 다르면 "M월 D일 ~ M월 D일" 형식
 */
export function formatJobDateTime(startDate: Date, endDate: Date): string {
  const startMonth = startDate.getMonth() + 1;
  const startDay = startDate.getDate();
  const startDayName = DAY_NAMES[startDate.getDay()];
  const startHour = String(startDate.getHours()).padStart(2, '0');
  const startMin = String(startDate.getMinutes()).padStart(2, '0');
  const endHour = String(endDate.getHours()).padStart(2, '0');
  const endMin = String(endDate.getMinutes()).padStart(2, '0');

  const isSameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();

  if (isSameDay) {
    return `${startMonth}월 ${startDay}일 (${startDayName}) ${startHour}:${startMin} - ${endHour}:${endMin}`;
  }

  const endMonth = endDate.getMonth() + 1;
  const endDay = endDate.getDate();
  const endDayName = DAY_NAMES[endDate.getDay()];
  return `${startMonth}월 ${startDay}일 (${startDayName}) ${startHour}:${startMin} ~ ${endMonth}월 ${endDay}일 (${endDayName}) ${endHour}:${endMin}`;
}
