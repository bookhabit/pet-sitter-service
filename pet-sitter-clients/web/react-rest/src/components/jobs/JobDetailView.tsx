import { Badge, Button, Divider, Flex, Spacing, Text } from '@/design-system';
import { Image } from '@/design-system/atoms/Image/Image';

import type { Job } from '@/schemas/job.schema';
import type { ApproveStatus } from '@/schemas/job-application.schema';
import { formatDateTime, formatPrice } from '@/utils/format';

import { ApplyButton } from './ApplyButton';

interface Props {
  job: Job;
  isOwner: boolean;
  /** 현재 유저가 PetSitter 역할을 가지고 있는지 여부 */
  isPetSitter: boolean;
  /** PetSitter의 현재 지원 상태. null이면 미지원 */
  appliedStatus: ApproveStatus | null;
  /** 지원 mutation 진행 중 */
  isApplying: boolean;
  /** 지원 mutation 에러 메시지 */
  applyErrorMessage: string | null;
  onApply: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onNavigateBack: () => void;
  /** PetOwner(작성자) 전용: 지원자 관리 페이지로 이동 */
  onNavigateToApplications: () => void;
  isDeleting: boolean;
}

/**
 * [View] 구인공고 상세 — 순수 UI 표현만 담당
 *
 * - isOwner === true  → "지원자 관리" 버튼 + 수정/삭제 버튼 표시
 * - isPetSitter && !isOwner → ApplyButton 표시
 * - PetOwner이면서 공고 작성자가 아닌 경우 → 지원/관리 UI 미표시
 */
export function JobDetailView({
  job,
  isOwner,
  isPetSitter,
  appliedStatus,
  isApplying,
  applyErrorMessage,
  onApply,
  onDelete,
  onEdit,
  onNavigateBack,
  onNavigateToApplications,
  isDeleting,
}: Props) {
  return (
    <div className="mx-auto max-w-[60rem] px-16 py-24">
      {/* 뒤로가기 */}
      <Button variant="ghost" size="sm" onClick={onNavigateBack}>
        ← 목록으로
      </Button>

      <Spacing size={24} />

      {/* 헤더: 돌봄 내용 + 등록일 */}
      <Flex direction="column" gap={8}>
        <Text as="h1" size="t1" className="font-bold">
          {job.activity}
        </Text>
        <Text size="caption" color="secondary">
          등록일: {formatDateTime(job.createdAt)}
        </Text>
      </Flex>

      <Spacing size={24} />
      <Divider />
      <Spacing size={24} />

      {/* 돌봄 일정 */}
      <section>
        <Text as="h2" size="t2" className="font-bold">
          돌봄 일정
        </Text>
        <Spacing size={8} />
        <Text size="b1" color="secondary">
          {formatDateTime(job.start_time)} ~ {formatDateTime(job.end_time)}
        </Text>
      </section>

      {/* 주소 */}
      {job.address !== null && (
        <>
          <Spacing size={24} />
          <section>
            <Text as="h2" size="t2" className="font-bold">
              주소
            </Text>
            <Spacing size={8} />
            <Text size="b1" color="secondary">
              📍 {job.address}
            </Text>
          </section>
        </>
      )}

      {/* 가격 */}
      {job.price !== null && (
        <>
          <Spacing size={24} />
          <section>
            <Text as="h2" size="t2" className="font-bold">
              가격
            </Text>
            <Spacing size={8} />
            <Badge variant="primary" size="md">
              {formatPrice(job.price, job.price_type)}
            </Badge>
          </section>
        </>
      )}

      <Spacing size={24} />
      <Divider />
      <Spacing size={24} />

      {/* 반려동물 목록 */}
      <section>
        <Text as="h2" size="t2" className="font-bold">
          반려동물
        </Text>
        <Spacing size={16} />
        <Flex direction="column" gap={16} as="ul">
          {job.pets.map((pet) => (
            <li key={pet.id} className="rounded-2xl border border-grey200 bg-white p-16">
              <Flex justify="between" align="start" gap={12}>
                <Flex direction="column" gap={4}>
                  <Flex gap={8} align="center">
                    <Text as="h3" size="b1" className="font-bold">
                      {pet.name}
                    </Text>
                    <Badge variant="neutral" size="sm">
                      {pet.species === 'Dog' ? '🐶 강아지' : '🐱 고양이'}
                    </Badge>
                  </Flex>
                  <Text size="b2" color="secondary">
                    {pet.breed} · {pet.age}살{pet.size !== null ? ` · ${pet.size}` : ''}
                  </Text>
                </Flex>
              </Flex>

              {/* 반려동물 사진 */}
              {pet.photos.length > 0 && (
                <>
                  <Spacing size={12} />
                  <Flex gap={8} wrap>
                    {pet.photos.map((photo) => (
                      <Image
                        key={photo.id}
                        src={photo.url}
                        alt={`${pet.name} 사진`}
                        className="h-[8rem] w-[8rem] rounded-lg"
                      />
                    ))}
                  </Flex>
                </>
              )}
            </li>
          ))}
        </Flex>
      </section>

      {/* 공고 사진 */}
      {job.photos.length > 0 && (
        <>
          <Spacing size={24} />
          <Divider />
          <Spacing size={24} />
          <section>
            <Text as="h2" size="t2" className="font-bold">
              공고 사진
            </Text>
            <Spacing size={16} />
            <Flex gap={8} wrap>
              {job.photos.map((photo) => (
                <Image
                  key={photo.id}
                  src={photo.url}
                  alt="공고 사진"
                  className="h-[12rem] w-[12rem] rounded-xl"
                />
              ))}
            </Flex>
          </section>
        </>
      )}

      {/* PetSitter 전용: 지원하기 버튼 (작성자는 본인 공고에 지원 불가) */}
      {isPetSitter && !isOwner && (
        <>
          <Spacing size={32} />
          <Divider />
          <Spacing size={24} />
          <ApplyButton
            appliedStatus={appliedStatus}
            isApplying={isApplying}
            errorMessage={applyErrorMessage}
            onApply={onApply}
          />
        </>
      )}

      {/* PetOwner(작성자) 전용: 지원자 관리 페이지 이동 버튼 */}
      {isOwner && (
        <>
          <Spacing size={32} />
          <Divider />
          <Spacing size={24} />
          <Button
            variant="secondary"
            size="md"
            onClick={onNavigateToApplications}
            className="w-full"
          >
            지원자 관리
          </Button>
        </>
      )}

      {/* 작성자 전용: 수정 / 삭제 버튼 */}
      {isOwner && (
        <>
          <Spacing size={12} />
          <Flex gap={12}>
            <Button variant="secondary" size="md" onClick={onEdit} className="flex-1">
              수정
            </Button>
            <Button
              variant="danger"
              size="md"
              isLoading={isDeleting}
              onClick={onDelete}
              className="flex-1"
            >
              삭제
            </Button>
          </Flex>
        </>
      )}
    </div>
  );
}
