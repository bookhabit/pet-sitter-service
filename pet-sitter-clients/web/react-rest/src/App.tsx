import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { DesignSystemPage } from './pages/design-system/DesignSystemPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<main />} />
        {import.meta.env.DEV && <Route path="/_ds" element={<DesignSystemPage />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
