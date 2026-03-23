import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

// useSearchParams()를 사용하는 LoginForm을 위한 Suspense boundary
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
