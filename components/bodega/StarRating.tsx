'use client';

import { memo } from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const gapClasses = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1.5',
};

function StarIcon({ 
  filled, 
  half, 
  className 
}: { 
  filled: boolean; 
  half: boolean; 
  className: string;
}) {
  if (half) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="halfStar">
            <stop offset="50%" stopColor="rgb(var(--bodega-gold))" />
            <stop offset="50%" stopColor="rgb(var(--bodega-secondary) / 0.4)" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="url(#halfStar)"
        />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? 'rgb(var(--bodega-gold))' : 'rgb(var(--bodega-secondary) / 0.4)'}
      />
    </svg>
  );
}

export const StarRating = memo(function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md' 
}: StarRatingProps) {
  const stars = [];
  
  for (let i = 1; i <= maxRating; i++) {
    const filled = rating >= i;
    const half = !filled && rating >= i - 0.5 && rating < i;
    
    stars.push(
      <StarIcon
        key={i}
        filled={filled}
        half={half}
        className={sizeClasses[size]}
      />
    );
  }

  return (
    <div 
      className={`flex items-center ${gapClasses[size]}`}
      role="img"
      aria-label={`${rating} ud af ${maxRating} stjerner`}
    >
      {stars}
    </div>
  );
});

export default StarRating;
