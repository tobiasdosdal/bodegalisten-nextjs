'use client'

import Image from 'next/image'

interface UserAvatarProps {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function UserAvatar({ src, name, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  }

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  if (src) {
    return (
      <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={name || 'User avatar'}
          fill
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-bodega-accent/20 flex items-center justify-center font-semibold text-bodega-accent ${className}`}
    >
      {getInitials(name)}
    </div>
  )
}
