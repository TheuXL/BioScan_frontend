import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
}

export function GlassCard({ children, className = '', active = false }: GlassCardProps) {
  return (
    <div
      className={`glass-panel rounded-xl p-4 transition-all duration-300 ${active ? 'active-card' : ''} hover-glow ${className}`}
    >
      {children}
    </div>
  );
}
