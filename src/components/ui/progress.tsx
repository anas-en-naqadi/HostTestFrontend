'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';

type ProgressProps = {
  value: number;
  className?: string;
};

export default function ProgressBar({ value, className = '' }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      value={value}
      className={`relative h-[0.35rem] w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-cyan-700 transition-all duration-300"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
