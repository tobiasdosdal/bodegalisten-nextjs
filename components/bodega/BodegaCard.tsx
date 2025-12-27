'use client';

import { memo, ReactNode } from 'react';

interface BodegaCardProps {
  children: ReactNode;
  elevated?: boolean;
  className?: string;
}

export const BodegaCard = memo(function BodegaCard({ 
  children, 
  elevated = false, 
  className = '' 
}: BodegaCardProps) {
  const baseClasses = 'relative overflow-hidden rounded-bodega-lg border';
  
  const surfaceClasses = elevated
    ? 'bg-bodega-surface-elevated border-bodega-secondary/20 shadow-lg shadow-black/20'
    : 'bg-bodega-surface border-bodega-secondary/15';

  return (
    <div className={`${baseClasses} ${surfaceClasses} ${className}`}>
      {/* Glass morphism gradient overlay */}
      <div 
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent"
        aria-hidden="true"
      />
      {/* Subtle inner glow at top */}
      <div 
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bodega-accent/20 to-transparent"
        aria-hidden="true"
      />
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
});

export default BodegaCard;
