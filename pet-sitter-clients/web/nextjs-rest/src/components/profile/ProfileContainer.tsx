'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useUserQuery } from '@/hooks/user';
import { useProfileEditForm } from '@/hooks/forms/useProfileEditForm';

import { ProfileView } from './ProfileView';
import { ProfileEditForm } from './ProfileEditForm';
import { ProfileLoadingView } from './exception/ProfileLoadingView';
import { ProfileErrorView } from './exception/ProfileErrorView';

import type { User } from '@/schemas/user.schema';

interface Props {
  /** 조회 대상 사용자 ID */
  userId: string;
  /** true이면 수정 버튼과 이메일이 표시된다 */
  isMe: boolean;
}

interface ProfileReadyProps {
  userId: string;
  isMe: boolean;
  user: User;
}

/**
 * [Internal] 데이터가 확보된 이후에만 렌더링되는 컴포넌트.
 *
 * user가 항상 존재함이 보장된 상태에서 useProfileEditForm을 호출하므로
 * 비-null 단언(!)이 필요 없고 Rules of Hooks도 위반하지 않는다.
 */
function ProfileReady({ userId, isMe, user }: ProfileReadyProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const editForm = useProfileEditForm({
    userId,
    currentUser: user,
    onSuccess: () => setIsEditing(false),
  });

  const handleMessageClick = () => {
    // 프로필 페이지에서는 공통 지원 이력이 없으므로 채팅 목록 페이지로 이동
    // 사용자가 목록에서 해당 상대방과의 채팅방을 선택한다
    router.push('/chat');
  };

  if (isEditing) {
    return (
      <ProfileEditForm
        register={editForm.register}
        onSubmit={editForm.onSubmit}
        onCancel={() => {
          editForm.onCancel();
          setIsEditing(false);
        }}
        errors={editForm.errors}
        isPending={editForm.isPending}
        serverError={editForm.serverError}
      />
    );
  }

  return (
    <ProfileView
      user={user}
      isMe={isMe}
      onEditClick={() => setIsEditing(true)}
      onMessageClick={handleMessageClick}
    />
  );
}

/**
 * [Container] 프로필 카드 데이터 연결
 *
 * 책임:
 *   - useUserQuery로 프로필 데이터 확보
 *   - loading / error / success 상태 분기 처리
 *   - 데이터가 준비된 경우에만 ProfileReady를 렌더링
 */
export function ProfileContainer({ userId, isMe }: Props) {
  const { data: user, isPending, isError, refetch } = useUserQuery(userId);

  if (isPending) {
    return <ProfileLoadingView />;
  }

  if (isError || !user) {
    return <ProfileErrorView onRetry={() => void refetch()} />;
  }

  return <ProfileReady userId={userId} isMe={isMe} user={user} />;
}
