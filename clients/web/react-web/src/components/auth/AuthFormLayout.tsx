import type { ReactNode } from 'react';

import { Flex, Spacing, Text } from '@/design-system';
import { LogoIcon } from '@/design-system/icons';

interface AuthFormLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthFormLayout({ title, subtitle, children }: AuthFormLayoutProps) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      className="min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100 px-24 py-32"
    >
      <div className="w-full max-w-[44.8rem] rounded-2xl bg-white p-32 shadow-xl">
        <Flex direction="column" align="center">
          <div className="flex size-64 items-center justify-center rounded-full bg-primary">
            <LogoIcon size={32} />
          </div>
          <Spacing size={16} />
          <Text as="h1" size="t1" className="text-center">
            {title}
          </Text>
          {subtitle && (
            <>
              <Spacing size={8} />
              <Text size="b1" color="secondary" className="text-center">
                {subtitle}
              </Text>
            </>
          )}
        </Flex>
        <Spacing size={32} />
        {children}
      </div>
    </Flex>
  );
}
