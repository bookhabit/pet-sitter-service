'use client';

import { Flex } from '@/design-system';
import { Spinner } from '@/design-system/atoms/Spinner';

export function PageLoadingView() {
  return (
    <Flex align="center" justify="center" className="bg-background min-h-screen">
      <Spinner size={36} />
    </Flex>
  );
}
