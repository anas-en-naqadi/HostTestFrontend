'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';

type ProgressProps = {
  value: number;
  color?: string;
  className?: string;
};

export default function ProgressBar({ value, className = '', color = 'custom-blue-bg' }: ProgressProps) {
  // Ensure value is a number and between 0-100
  const safeValue = typeof value === 'number' ? Math.max(0, Math.min(100, value)) : 0;

  return (
    <ProgressPrimitive.Root
      value={safeValue}
      className={`relative h-[0.35rem] w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
    >
      <ProgressPrimitive.Indicator
        className={`h-full w-full flex-1 ${color} transition-all duration-300`}
        style={{ transform: `translateX(-${100 - safeValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
