import { cn } from '@/lib/utils';
import { ButtonVariant } from '@/types';
import { ReactNode } from 'react';
import Spinner from '../ui/Spinner';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  variant = 'primary',
  onClick,
  disabled,
  loading,
  className,
  type = 'button',
}: ButtonProps) {
  const variantClasses = {
    primary: 'linkedin-button-primary',
    secondary: 'linkedin-button-secondary',
    ghost: 'linkedin-button-ghost',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        variantClasses[variant],
        'flex items-center justify-center gap-2',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading && <Spinner size="sm" className="border-current border-r-transparent" />}
      {children}
    </button>
  );
}
