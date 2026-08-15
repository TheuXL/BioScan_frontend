import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'urgent';
}

const variants = {
  primary:
    'bg-secondary-container text-on-secondary-container hover:bg-secondary font-bold',
  ghost:
    'border border-secondary-container/50 text-secondary-container hover:bg-secondary-container/10',
  urgent: 'bg-error-container text-white hover:bg-error-container/80',
};

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`font-label-md rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
