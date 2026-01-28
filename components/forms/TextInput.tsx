'use client';

import { TEXT_LIMITS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showCounter?: boolean;
  error?: string;
  className?: string;
}

export default function TextInput({
  value,
  onChange,
  placeholder = 'Enter your text here...',
  rows = 6,
  maxLength = TEXT_LIMITS.max,
  showCounter = true,
  error,
  className,
}: TextInputProps) {
  const isNearLimit = value.length > maxLength * 0.9;
  const isOverLimit = value.length > maxLength;

  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          'linkedin-textarea',
          error && 'border-linkedin-error focus:ring-linkedin-error',
          className
        )}
      />
      <div className="flex justify-between items-center mt-2">
        {error && (
          <span className="text-sm text-linkedin-error">{error}</span>
        )}
        {showCounter && (
          <span
            className={cn(
              'text-sm ml-auto',
              isOverLimit ? 'text-linkedin-error' : isNearLimit ? 'text-yellow-600' : 'text-linkedin-gray-600'
            )}
          >
            {value.length} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
