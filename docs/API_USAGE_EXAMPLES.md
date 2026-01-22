# Jobs API 사용 예시 10가지

## 1. 기본 조회 (모든 구인공고)
```bash
GET /jobs
```
- 모든 구인공고를 기본 정렬(start_time asc)로 조회
- 기본 limit: 20개

---

## 2. 날짜 범위로 필터링
```bash
GET /jobs?start_time_after=2026-01-01T00:00:00Z&end_time_before=2026-12-31T23:59:59Z
```
- 2026년 1월 1일 이후 시작하는 구인공고
- 2026년 12월 31일 이전에 끝나는 구인공고

---

## 3. Activity 검색 (Full-Text Search)
```bash
GET /jobs?activity=산책
```
- activity 필드에 "산책"이 포함된 구인공고 검색
- 대소문자 구분 없음

---

## 4. Pet 나이 필터링
```bash
GET /jobs?pets[age_below]=5
```
- 5세 이하의 반려동물을 가진 구인공고만 조회

```bash
GET /jobs?pets[age_above]=3&pets[age_below]=7
```
- 3세 이상 7세 이하의 반려동물을 가진 구인공고

---

## 5. Pet 종류 필터링
```bash
GET /jobs?pets[species]=Dog
```
- 강아지만 있는 구인공고

```bash
GET /jobs?pets[species]=Cat,Dog
```
- 고양이 또는 강아지가 있는 구인공고 (쉼표로 구분)

---

## 6. 정렬 옵션
```bash
GET /jobs?sort=start_time:desc
```
- 시작 시간 내림차순 정렬

```bash
GET /jobs?sort=end_time:asc
```
- 종료 시간 오름차순 정렬

---

## 7. Limit 조정
```bash
GET /jobs?limit=10
```
- 10개만 조회

```bash
GET /jobs?limit=50
```
- 50개 조회 (최대 100개까지 가능)

---

## 8. Cursor 기반 Pagination
```bash
# 첫 페이지
GET /jobs?limit=10

# 응답에서 cursor 받음
# {
#   "items": [...],
#   "cursor": "job-id-123"
# }

# 다음 페이지
GET /jobs?limit=10&cursor=job-id-123
```

---

## 9. 복합 필터 (여러 조건 조합)
```bash
GET /jobs?start_time_after=2026-02-01T00:00:00Z&activity=산책&pets[species]=Dog&pets[age_below]=5&sort=start_time:desc&limit=15
```
- 2026년 2월 1일 이후 시작
- activity에 "산책" 포함
- 강아지 중 5세 이하
- 시작 시간 내림차순
- 15개만 조회

---

## 10. 고급 검색 (모든 필터 조합)
```bash
GET /jobs?start_time_after=2026-01-15T09:00:00Z&start_time_before=2026-03-31T18:00:00Z&end_time_after=2026-01-15T10:00:00Z&activity=돌봄&pets[species]=Cat,Dog&pets[age_above]=1&pets[age_below]=10&sort=end_time:asc&limit=25&cursor=previous-cursor-id
```
- 시작 시간: 2026-01-15 09:00 이후 ~ 2026-03-31 18:00 이전
- 종료 시간: 2026-01-15 10:00 이후
- activity: "돌봄" 포함
- 반려동물: 고양이 또는 강아지, 1세 이상 10세 이하
- 정렬: 종료 시간 오름차순
- Limit: 25개
- Cursor: 이전 페이지에서 받은 cursor 사용

---

## Swagger UI에서 테스트하는 방법

1. `http://localhost:8000/api` 접속
2. `GET /jobs` 엔드포인트 클릭
3. "Try it out" 버튼 클릭
4. Parameters 섹션에서 원하는 필터 입력
5. "Execute" 버튼 클릭

## 로그 확인

서버 콘솔에서 다음과 같은 로그를 확인할 수 있습니다:

```
🔍 [JobsService.findAll] 요청된 쿼리 파라미터: {...}
📅 [필터] start_time >= 2026-01-01T00:00:00Z
🔎 [필터] activity contains: 산책
🐾 [필터] pet species in: ["Cat", "Dog"]
📊 [정렬] start_time desc
📄 [페이징] limit: 20 take: 21
🔧 [Prisma Query] where 조건: {...}
⏱️ [쿼리 실행 시간] 45 ms
📦 [조회 결과] 총 15개 조회됨
✅ [최종 결과]
  - 반환할 items: 15개
  - 다음 페이지 존재: false
  - nextCursor: null
```
