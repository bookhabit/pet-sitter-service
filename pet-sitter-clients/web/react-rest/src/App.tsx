import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { GlobalModal } from './components/GlobalModal';
import { AuthGuard } from './guards/AuthGuard';
import { GuestGuard } from './guards/GuestGuard';
import { RoleGuard } from './guards/RoleGuard';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';

import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ChatPage } from './pages/chat/ChatPage';
import { ChatRoomPage } from './pages/chat/ChatRoomPage';
import { DesignSystemPage } from './pages/design-system/DesignSystemPage';
import { FavoritesPage } from './pages/favorites/FavoritesPage';
import { JobDetailPage } from './pages/jobs/JobDetailPage';
import { JobsPage } from './pages/jobs/JobsPage';
import { JobCreatePage } from './pages/jobs/JobCreatePage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { PageAsyncBoundary } from './components/common/globalException/boundary';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 개발 전용 디자인 시스템 */}
        {import.meta.env.DEV && <Route path="/_ds" element={<DesignSystemPage />} />}

        {/* Public Routes — 미인증 사용자 전용 (로그인 사용자 접근 시 /jobs 로 리다이렉트) */}
        <Route element={<GuestGuard />}>
          <Route element={<AuthLayout />}>
            <Route element={<PageAsyncBoundary />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
          </Route>
        </Route>

        {/* Protected Routes — 인증 사용자 전용 (미인증 접근 시 /login 으로 리다이렉트) */}
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route element={<PageAsyncBoundary />}>
              {/* 홈 탭 */}
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:jobId" element={<JobDetailPage />} />

              {/* 구인공고 등록 — PetOwner 전용 */}
              <Route element={<RoleGuard allowedRoles={['PetOwner']} />}>
                <Route path="/jobs/write" element={<JobCreatePage />} />
              </Route>

              {/* 채팅 탭 */}
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:roomId" element={<ChatRoomPage />} />

              {/* 즐겨찾기 탭 */}
              <Route path="/favorites" element={<FavoritesPage />} />

              {/* 프로필 탭 */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
            </Route>
          </Route>
        </Route>

        {/* 기본 리다이렉트 */}
        <Route path="/" element={<Navigate to="/jobs" replace />} />
        <Route path="*" element={<Navigate to="/jobs" replace />} />
      </Routes>

      {/* 전역 모달 렌더러 — 라우트 외부에 위치하여 모든 페이지에서 접근 가능 */}
      <GlobalModal />
    </BrowserRouter>
  );
}

export default App;
