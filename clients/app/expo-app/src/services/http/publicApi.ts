import axios from "axios";

import { API_BASE_URL } from "@/config/apiBaseUrl";

// publicApi: 인증 없이 호출하는 엔드포인트 전용
// - POST /users (회원가입)
// - POST /sessions (로그인)
// - POST /sessions/refresh (토큰 갱신) ← 여기서만 refresh 호출
console.log("API_BASE_URL", API_BASE_URL);
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});
