# 사진 업로드 가이드

> Pre-upload + Attach 패턴으로 REST와 GraphQL 모두 **2번 호출**로 완료

---

## 설계 흐름

```
[1단계] POST /photos/upload (또는 GraphQL uploadPhotos)
         여러 파일을 한 번에 업로드 → Photo[] 반환 (entity 미연결)

[2단계] POST /jobs  (또는 GraphQL createJob)
         body에 photo_ids 포함 → 공고 생성 + 사진 자동 연결
```

---

## 파일 검증 규칙

| 항목 | 제한 |
|------|------|
| 허용 형식 | JPEG, PNG, WebP |
| 허용 확장자 | `.jpg` `.jpeg` `.png` `.webp` |
| 최대 크기 | 파일당 5MB |
| 최대 개수 | 요청당 10개 |
| Magic bytes | 실제 바이너리 시그니처 검증 (MIME 조작 우회 방어) |

---

## REST API

### 사전 준비: 로그인

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@test.com",
    "password": "password123"
  }'
```

응답:
```json
{
  "user_id": "uuid-...",
  "auth_header": "Bearer eyJhbGci..."
}
```

이후 모든 요청에 `Authorization: Bearer {auth_header값}` 헤더 필요

---

### [1단계] POST /photos/upload — 다건 파일 업로드

```bash
curl -X POST http://localhost:3000/photos/upload \
  -H "Authorization: Bearer {TOKEN}" \
  -F "files=@/path/to/job_photo.jpg" \
  -F "files=@/path/to/pet_photo.png"
```

응답:
```json
[
  {
    "id": "photo-uuid-1",
    "url": "/uploads/temp/aaaa-1111.jpg",
    "file_name": "temp/aaaa-1111.jpg",
    "original_name": "job_photo.jpg",
    "mime_type": "image/jpeg",
    "size": 204800,
    "uploader_id": "user-uuid",
    "user_id": null,
    "job_id": null,
    "pet_id": null,
    "createdAt": "2026-02-10T12:00:00Z"
  },
  {
    "id": "photo-uuid-2",
    "url": "/uploads/temp/bbbb-2222.png",
    ...
  }
]
```

> 반환된 `id` 값들을 다음 단계에서 사용합니다.

---

### [2단계] POST /jobs — 공고 등록 + 사진 연결

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "start_time": "2026-03-01T09:00:00Z",
    "end_time": "2026-03-01T18:00:00Z",
    "activity": "강아지 산책 및 돌봄 서비스",
    "photo_ids": ["photo-uuid-1"],
    "pets": [
      {
        "name": "멍멍이",
        "age": 3,
        "species": "Dog",
        "breed": "말티즈",
        "size": "소형",
        "photo_ids": ["photo-uuid-2"]
      }
    ]
  }'
```

응답:
```json
{
  "id": "job-uuid",
  "creator_user_id": "user-uuid",
  "start_time": "2026-03-01T09:00:00Z",
  "end_time": "2026-03-01T18:00:00Z",
  "activity": "강아지 산책 및 돌봄 서비스",
  "pets": [
    { "id": "pet-uuid", "name": "멍멍이", ... }
  ],
  "createdAt": "2026-02-10T12:00:00Z"
}
```

> `photo_ids`에 포함된 사진들은 자동으로 해당 job/pet에 연결됩니다.

---

### 단건 업로드 (기존 방식, 하위 호환)

```bash
# 공고에 사진 단건 추가 (이미 생성된 공고에 사진 추가할 때)
curl -X POST http://localhost:3000/jobs/{jobId}/photos \
  -H "Authorization: Bearer {TOKEN}" \
  -F "file=@/path/to/photo.jpg"

# 펫에 사진 단건 추가
curl -X POST http://localhost:3000/pets/{petId}/photos \
  -H "Authorization: Bearer {TOKEN}" \
  -F "file=@/path/to/pet_photo.jpg"

# 유저 프로필 사진 단건 추가
curl -X POST http://localhost:3000/users/{userId}/photos \
  -H "Authorization: Bearer {TOKEN}" \
  -F "file=@/path/to/profile.jpg"
```

---

### 사진 삭제

```bash
curl -X DELETE http://localhost:3000/photos/{photoId} \
  -H "Authorization: Bearer {TOKEN}"
```

> 업로더 본인만 삭제 가능. 응답: `204 No Content`

---

### 업로드된 사진 조회 (정적 파일)

```bash
# url 필드 값으로 직접 접근
curl http://localhost:3000/uploads/temp/aaaa-1111.jpg
```

---

## GraphQL API

GraphQL Playground: `http://localhost:3000/api` → Playground 탭

파일은 **Base64 인코딩**해서 전송합니다.

### Base64 인코딩 방법

```bash
# macOS / Linux
base64 -i photo.jpg

# Node.js
node -e "console.log(require('fs').readFileSync('photo.jpg').toString('base64'))"
```

---

### [1단계] uploadPhotos — 다건 파일 업로드

```graphql
mutation UploadPhotos($files: [Base64FileInput!]!) {
  uploadPhotos(files: $files) {
    id
    url
    original_name
    mime_type
    size
    uploader_id
    createdAt
  }
}
```

Variables:
```json
{
  "files": [
    {
      "base64": "/9j/4AAQSkZJRgAB...",
      "originalName": "job_photo.jpg",
      "mimeType": "image/jpeg"
    },
    {
      "base64": "iVBORw0KGgoAAAA...",
      "originalName": "pet_photo.png",
      "mimeType": "image/png"
    }
  ]
}
```

HTTP Headers:
```json
{
  "Authorization": "Bearer eyJhbGci..."
}
```

---

### [2단계] createJob — 공고 등록 + 사진 연결

```graphql
mutation CreateJob($data: CreateJobInput!) {
  createJob(data: $data) {
    id
    creator_user_id
    start_time
    end_time
    activity
    pets {
      id
      name
      species
    }
    createdAt
  }
}
```

Variables:
```json
{
  "data": {
    "start_time": "2026-03-01T09:00:00Z",
    "end_time": "2026-03-01T18:00:00Z",
    "activity": "강아지 산책 및 돌봄 서비스",
    "photo_ids": ["photo-uuid-1"],
    "pets": [
      {
        "name": "멍멍이",
        "age": 3,
        "species": "Dog",
        "breed": "말티즈",
        "size": "소형",
        "photo_ids": ["photo-uuid-2"]
      }
    ]
  }
}
```

---

### 단건 업로드 (하위 호환)

```graphql
# 공고 사진 단건 업로드
mutation UploadJobPhoto($jobId: String!, $file: Base64FileInput!) {
  uploadJobPhoto(jobId: $jobId, file: $file) {
    id
    url
    job_id
  }
}

# 펫 사진 단건 업로드
mutation UploadPetPhoto($petId: String!, $file: Base64FileInput!) {
  uploadPetPhoto(petId: $petId, file: $file) {
    id
    url
    pet_id
  }
}

# 유저 프로필 사진 단건 업로드
mutation UploadUserPhoto($userId: String!, $file: Base64FileInput!) {
  uploadUserPhoto(userId: $userId, file: $file) {
    id
    url
    user_id
  }
}
```

Variables (단건 공통):
```json
{
  "jobId": "job-uuid",
  "file": {
    "base64": "/9j/4AAQSkZJRgAB...",
    "originalName": "photo.jpg",
    "mimeType": "image/jpeg"
  }
}
```

---

### 사진 삭제

```graphql
mutation DeletePhoto($id: String!) {
  deletePhoto(id: $id)
}
```

Variables:
```json
{ "id": "photo-uuid" }
```

---

## Postman / Thunder Client 설정

### REST — multipart/form-data 설정

```
Method:  POST
URL:     http://localhost:3000/photos/upload
Headers: Authorization: Bearer {TOKEN}
Body:    form-data
  Key: files  Type: File  Value: [파일 선택]
  Key: files  Type: File  Value: [파일 선택]  ← 여러 개 추가 가능
```

> Postman에서 동일한 key 이름(`files`)으로 여러 행 추가하면 다건 업로드 됩니다.

---

## 오류 코드 정리

| HTTP | GraphQL error | 원인 |
|------|--------------|------|
| 400 | BAD_USER_INPUT | 빈 파일 / 크기 초과 / 허용되지 않는 형식 / Magic bytes 불일치 |
| 401 | UNAUTHENTICATED | 토큰 없음 또는 만료 |
| 403 | FORBIDDEN | 업로더 본인이 아닌 사용자가 삭제 시도 |
| 404 | NOT_FOUND | 대상 user/job/pet 또는 photo가 존재하지 않음 |
