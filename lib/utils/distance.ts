export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

export type TransportType = 'walk' | 'bike' | 'car'

const TRANSPORT_SPEEDS: Record<TransportType, number> = {
  walk: 5,
  bike: 15,
  car: 30,
}

export function calculateTravelTime(km: number, transportType: TransportType): number {
  const speed = TRANSPORT_SPEEDS[transportType]
  return (km / speed) * 60
}

export function formatTravelTime(minutes: number): string {
  if (minutes < 1) {
    return '<1 min'
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)
  if (remainingMinutes === 0) {
    return `${hours} t`
  }
  return `${hours} t ${remainingMinutes} min`
}
