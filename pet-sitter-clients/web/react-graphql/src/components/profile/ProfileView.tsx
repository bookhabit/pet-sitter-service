import { Button, Flex, Text } from '@/design-system';
import { Image } from '@/design-system/atoms/Image/Image';

import type { User } from '@/schemas/user.schema';

interface Props {
  user: User;
  isMe: boolean;
  onEditClick: () => void;
  /** !isMe일 때 표시하는 메시지 보내기 핸들러 */
  onMessageClick: () => void;
}

/**
 * [View] 프로필 카드 표시 컴포넌트
 *
 * - 공통: 프로필 사진, 이름, 역할
 * - 본인(isMe)만: 이메일, 수정 버튼
 */
export function ProfileView({ user, isMe, onEditClick, onMessageClick }: Props) {
  const profilePhotoUrl = user.photos[0]?.url ?? null;
  const roleLabel = user.roles.join(', ');

  return (
    <div className="p-20 rounded-2xl border border-grey200 bg-white">
      <Flex align="center" gap={16}>
        <Image
          src={profilePhotoUrl ?? undefined}
          alt={`${user.full_name} 프로필 사진`}
          className="h-64 w-64 rounded-full"
        />

        <Flex direction="column" gap={4} className="flex-1">
          <Text size="t2" as="p">
            {user.full_name}
          </Text>
          <Text size="b2" color="secondary">
            역할: {roleLabel}
          </Text>
          {isMe && (
            <Text size="b2" color="secondary">
              {user.email}
            </Text>
          )}
        </Flex>

        {isMe && (
          <Button variant="ghost" size="sm" onClick={onEditClick}>
            수정
          </Button>
        )}
        {!isMe && (
          <Button variant="ghost" size="sm" onClick={onMessageClick}>
            메시지 보내기
          </Button>
        )}
      </Flex>
    </div>
  );
}
