'use client';

import { useState } from 'react';

// 1. verbatimModuleSyntax 규칙에 따른 타입 임포트
import type { ImgHTMLAttributes } from 'react';
import type { StaticImageData } from 'next/image';
import { Skeleton } from '../Skeleton';
import { ASSETS } from '@/design-system/images';
import { getFullImageUrl } from '@/utils/image';

// Next.js static image import returns StaticImageData; extract .src for <img>
function resolveImageSrc(src: string | StaticImageData): string {
  return typeof src === 'string' ? src : src.src;
}

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | StaticImageData;
  fallback?: string | StaticImageData;
  // isLoading 프롭은 외부에서 강제로 로딩 상태를 주입할 때 유용합니다.
}

export function Image({
  src,
  alt,
  className = '',
  fallback = ASSETS.DEFAULT_THUMB,
  ...props
}: ImageProps) {
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const fallbackSrc = resolveImageSrc(fallback);

  // 에러 발생 시 fallback 이미지가 다시 에러가 나는 무한 루프 방지
  const handleImageError = () => {
    if (!isError) setIsError(true);
  };

  // src가 없거나 에러가 났을 때 보여줄 최종 경로 결정
  const rawSrc = src ? resolveImageSrc(src) : undefined;
  const finalSrc = isError || !rawSrc ? fallbackSrc : getFullImageUrl(rawSrc);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 2. 로딩 및 스켈레톤 처리 */}
      {!isLoaded && !isError && <Skeleton className="absolute inset-0 h-full w-full" />}

      <img
        src={finalSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={handleImageError}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
}
