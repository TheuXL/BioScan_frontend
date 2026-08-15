import type { ReactNode } from 'react';

interface DataChipProps {
  children: ReactNode;
  variant?: 'default' | 'critical' | 'warning' | 'success' | 'info';
  className?: string;
}

const variants = {
  default: 'bg-white/5 text-on-surface-variant border-white/10',
  critical: 'bg-alert-red/20 text-error border-alert-red/30',
  warning: 'bg-alert-orange/20 text-alert-orange border-alert-orange/30',
  success: 'bg-alert-green/20 text-alert-green border-alert-green/30',
  info: 'bg-secondary-container/10 text-secondary-container border-secondary-container/30',
};

export function DataChip({ children, variant = 'default', className = '' }: DataChipProps) {
  return (
    <span
      className={`font-label inline-flex items-center rounded px-2 py-0.5 border uppercase tracking-wider text-[10px] ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
