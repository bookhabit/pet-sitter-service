import { useNavigate } from 'react-router-dom';

import { Badge, Button, Divider, Flex, Spacing, Text } from '@/design-system';
import { Image } from '@/design-system/atoms/Image/Image';

import type { Job } from '@/schemas/job.schema';
import { formatDateTime, formatPrice } from '@/utils/format';

interface Props {
  job: Job;
  isOwner: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}

/**
 * [View] 구인공고 상세 — 순수 UI 표현만 담당
 */
export function JobDetailView({ job, isOwner, onDelete, isDeleting }: Props) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-[60rem] px-16 py-24">
      {/* 뒤로가기 */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
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

      {/* 작성자 전용 버튼 */}
      {isOwner && (
        <>
          <Spacing size={32} />
          <Divider />
          <Spacing size={24} />
          <Flex gap={12}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate(`/jobs/${job.id}/edit`)}
              className="flex-1"
            >
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
