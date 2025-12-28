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
        {/* Gradient spinner - Copenhagen Tavern amber */}
        <svg
          className="animate-spin"
          viewBox="0 0 50 50"
          fill="none"
        >
          <defs>
            <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(45, 90%, 65%)" />
              <stop offset="50%" stopColor="hsl(38, 92%, 50%)" />
              <stop offset="100%" stopColor="hsl(30, 85%, 40%)" />
            </linearGradient>
          </defs>
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="hsl(35, 30%, 20%)"
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
        {/* Warm glow effect */}
        <div
          className="absolute inset-0 blur-lg opacity-40"
          aria-hidden="true"
        >
          <svg viewBox="0 0 50 50" fill="none">
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="80, 200"
              fill="none"
            />
          </svg>
        </div>
      </div>
      {text && (
        <p className={`${textSizeClasses[size]} text-stone-400 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
});

export default BodegaLoading;
