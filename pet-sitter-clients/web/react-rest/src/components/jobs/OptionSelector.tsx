import { cn, Flex } from '@/design-system';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface OptionSelectorProps<T extends string> {
  label: string;
  options: Option<T>[];
  selectedValue: T | undefined;
  onSelect: (value: T) => void;
  error?: string;
}

/**
 * [UI Component] 단일 선택 토글 버튼 그룹
 *
 * - 동물 종, 가격 단위 등 고정 옵션 중 하나를 선택하는 공통 UI
 * - 선택 상태는 부모에서 제어(controlled)
 */
export function OptionSelector<T extends string>({
  label,
  options,
  selectedValue,
  onSelect,
  error,
}: OptionSelectorProps<T>) {
  return (
    <div className="flex flex-col gap-8">
      <span className="text-b2 text-text-secondary">{label}</span>
      <Flex gap={8}>
        {options.map(({ value, label: optionLabel }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
              'py-10 rounded-xl border px-16 text-b2 font-bold transition-all',
              selectedValue === value
                ? 'border-primary bg-primary text-white'
                : 'border-grey200 bg-white text-text-primary hover:brightness-95',
            )}
          >
            {optionLabel}
          </button>
        ))}
      </Flex>
      {error && (
        <span className="text-caption text-danger" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
