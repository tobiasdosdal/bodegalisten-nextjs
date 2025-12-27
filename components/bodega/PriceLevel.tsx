'use client';

import { memo } from 'react';

interface PriceLevelProps {
  level: number;
  maxLevel?: number;
}

export const PriceLevel = memo(function PriceLevel({ 
  level, 
  maxLevel = 3 
}: PriceLevelProps) {
  const clampedLevel = Math.max(0, Math.min(level, maxLevel));
  
  return (
    <div 
      className="flex items-center gap-px font-semibold text-sm tracking-tight"
      role="img"
      aria-label={`Prisniveau ${clampedLevel} ud af ${maxLevel}`}
    >
      {Array.from({ length: maxLevel }, (_, i) => (
        <span
          key={i}
          className={
            i < clampedLevel
              ? 'text-bodega-gold'
              : 'text-bodega-secondary/40'
          }
        >
          $
        </span>
      ))}
    </div>
  );
});

export default PriceLevel;
