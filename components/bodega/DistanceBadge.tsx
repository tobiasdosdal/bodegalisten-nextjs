'use client';

import { memo } from 'react';

interface DistanceBadgeProps {
  meters: number;
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)}km`;
}

export const DistanceBadge = memo(function DistanceBadge({ meters }: DistanceBadgeProps) {
  const distance = formatDistance(meters);

  return (
    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bodega-accent/15 border border-bodega-accent/25">
      <LocationIcon className="w-3.5 h-3.5 text-bodega-accent" />
      <span className="text-xs font-medium text-bodega-accent">{distance}</span>
    </div>
  );
});

export default DistanceBadge;
