import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { GlobalModal } from './components/GlobalModal';
import { DesignSystemPage } from './pages/design-system/DesignSystemPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<main />} />
        {import.meta.env.DEV && <Route path="/_ds" element={<DesignSystemPage />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 전역 모달 렌더러 — 라우트 외부에 위치하여 모든 페이지에서 접근 가능 */}
      <GlobalModal />
    </BrowserRouter>
  );
}

export default App;
