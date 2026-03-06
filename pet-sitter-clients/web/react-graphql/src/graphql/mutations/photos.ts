/**
 * 사진 업로드 Mutation
 *
 * GraphQL 파일 업로드(graphql-multipart-request-spec)는 apollo-upload-client가
 * 필요하므로, 사진 업로드는 apollo-client.ts의 uploadWithFetch 헬퍼를 사용해
 * REST 엔드포인트에 직접 FormData POST를 수행합니다.
 *
 * 각 훅은 src/hooks/photos.ts에 구현되어 있으며,
 * 이 파일은 uploadWithFetch 사용 방식을 문서화하는 용도입니다.
 *
 * REST Endpoints:
 *   POST /photos/upload           → Photo[] (다중 업로드)
 *   POST /users/:id/photos        → Photo
 *   POST /jobs/:id/photos         → Photo
 *   POST /pets/:id/photos         → Photo
 *   DELETE /photos/:id            → 204
 */
export {};
