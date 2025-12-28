'use client'

interface OnlineStatusProps {
  isOnline: boolean
  lastActiveAt?: number | null
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function OnlineStatus({
  isOnline,
  lastActiveAt,
  showLabel = false,
  size = 'md'
}: OnlineStatusProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
  }

  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Lige nu'
    if (minutes < 60) return `${minutes} min siden`
    if (hours < 24) return `${hours} time${hours === 1 ? '' : 'r'} siden`
    if (days === 1) return 'I går'
    if (days < 7) return `${days} dage siden`
    return 'For længe siden'
  }

  if (isOnline) {
    return (
      <div className="flex items-center gap-1.5">
        <span className={`${sizeClasses[size]} rounded-full bg-green-500 animate-pulse`} />
        {showLabel && <span className="text-xs text-green-400">Aktiv nu</span>}
      </div>
    )
  }

  if (lastActiveAt) {
    return (
      <div className="flex items-center gap-1.5">
        <span className={`${sizeClasses[size]} rounded-full bg-gray-500`} />
        {showLabel && (
          <span className="text-xs text-gray-400">{getTimeAgo(lastActiveAt)}</span>
        )}
      </div>
    )
  }

  return null
}
