/**
 * Design System — 통합 내보내기
 *
 * 외부에서는 이 파일 하나에서 모든 것을 import합니다.
 * @example
 * import { Button, Flex, Spacing, Text } from '@/design-system';
 */

// Atoms
export { Badge } from './atoms/Badge';
export { Button } from './atoms/Button';
export { Checkbox } from './atoms/Checkbox';
export { Skeleton } from './atoms/Skeleton';
export { Spinner } from './atoms/Spinner';
export { Text } from './atoms/Text';
export { TextField } from './atoms/TextField';

// Layouts
export { Divider } from './layouts/Divider';
export { Flex } from './layouts/Flex';
export { Grid } from './layouts/Grid';
export { Spacing } from './layouts/Spacing';

// Tokens (타입 참조 용도)
export type { PrimitiveColor, SemanticColor } from './tokens/colors';
export type { SpacingToken } from './tokens/spacing';
export type { TypographySize } from './tokens/typography';

// Utilities
export { cn } from './utils/cn';
