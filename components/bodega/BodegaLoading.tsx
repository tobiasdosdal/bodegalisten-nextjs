'use client';

import { memo } from 'react';

interface BodegaLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const BodegaLoading = memo(function BodegaLoading({ 
  size = 'md',
  text = 'Indlæser...'
}: BodegaLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Gradient spinner */}
        <svg 
          className="animate-spin" 
          viewBox="0 0 50 50"
          fill="none"
        >
          <defs>
            <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--bodega-accent))" />
              <stop offset="100%" stopColor="rgb(var(--bodega-primary))" />
            </linearGradient>
          </defs>
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="rgb(var(--bodega-secondary) / 0.2)"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="url(#spinnerGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="80, 200"
            strokeDashoffset="0"
            fill="none"
          />
        </svg>
        {/* Glow effect */}
        <div 
          className="absolute inset-0 blur-md opacity-50"
          aria-hidden="true"
        >
          <svg viewBox="0 0 50 50" fill="none">
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke="rgb(var(--bodega-accent))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="80, 200"
              fill="none"
            />
          </svg>
        </div>
      </div>
      {text && (
        <p className={`${textSizeClasses[size]} text-bodega-secondary font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
});

export default BodegaLoading;
