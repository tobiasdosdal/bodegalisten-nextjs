'use client';

import { memo } from 'react';

interface SmokingBadgeProps {
  isAllowed: boolean | null;
}

function SmokeIcon({ className }: { className?: string }) {
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
      <path d="M18 12H2v4h16" />
      <path d="M22 12v4" />
      <path d="M7 12v-2a2 2 0 0 1 2-2h0a2 2 0 0 0 2-2V4" />
      <path d="M11 12V9a2 2 0 0 1 2-2h0a2 2 0 0 0 2-2V4" />
    </svg>
  );
}

function NoSmokeIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h6" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

function QuestionIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export const SmokingBadge = memo(function SmokingBadge({ isAllowed }: SmokingBadgeProps) {
  if (isAllowed === true) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
        <SmokeIcon className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-xs font-medium text-orange-400">Rygning</span>
      </div>
    );
  }

  if (isAllowed === false) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
        <NoSmokeIcon className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs font-medium text-emerald-400">Røgfri</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bodega-secondary/20 border border-bodega-secondary/30">
      <QuestionIcon className="w-3.5 h-3.5 text-bodega-secondary" />
      <span className="text-xs font-medium text-bodega-secondary">Ukendt</span>
    </div>
  );
});

export default SmokingBadge;
