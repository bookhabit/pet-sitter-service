module.exports = {
  'pet-sitter-server': {
    input: 'http://localhost:8000/api-json', // Swagger JSON URL 또는 로컬 파일 경로
    output: {
      mode: 'tags-split', // API 태그별로 파일 분할 (관리하기 편함)
      target: './src/api/generated', // 코드가 생성될 위치
      schemas: './src/api/model', // 타입(Interface)이 생성될 위치
      client: 'react-query', // React Query용 훅 생성
      mock: false, // MSW 모킹 코드까지 생성하고 싶다면 true
      override: {
        mutator: {
          path: './src/api/axios-instance.ts', // 커스텀 Axios 인스턴스 연결
          name: 'customInstance',
        },
      },
    },
  },
};
