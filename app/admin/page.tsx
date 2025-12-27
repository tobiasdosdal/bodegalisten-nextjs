'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { MapPin, CheckCircle, Star } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const bars = useQuery(api.bars.listAll)
  const isLoading = bars === undefined

  const activeBars = bars?.filter(b => b.active !== false) || []
  const inactiveBars = bars?.filter(b => b.active === false) || []

  const categoryCount: Record<string, number> = {}
  bars?.forEach((bar) => {
    if (bar.category) {
      categoryCount[bar.category] = (categoryCount[bar.category] || 0) + 1
    }
  })

  const stats = [
    {
      name: 'Total Barer',
      value: bars?.length || 0,
      icon: MapPin,
      href: '/admin/bars',
      color: 'bg-bodega-primary',
    },
    {
      name: 'Aktive Barer',
      value: activeBars.length,
      icon: CheckCircle,
      href: '/admin/bars',
      color: 'bg-green-600',
    },
    {
      name: 'Inaktive Barer',
      value: inactiveBars.length,
      icon: MapPin,
      href: '/admin/bars',
      color: 'bg-gray-600',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white font-bodega-rounded">Dashboard</h1>
        <p className="text-gray-400">Velkommen til Bodegalisten admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-bodega-surface rounded-2xl p-6 hover:bg-white/[0.08] transition-colors border border-white/[0.06]"
          >
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                <p className="text-2xl font-semibold text-white">
                  {isLoading ? '...' : stat.value}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-bodega-surface rounded-2xl p-6 border border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white mb-4">Seneste Barer</h2>
          {isLoading ? (
            <p className="text-gray-400">Indlæser...</p>
          ) : !bars || bars.length === 0 ? (
            <p className="text-gray-400">Ingen barer oprettet endnu</p>
          ) : (
            <div className="space-y-3">
              {bars.slice(0, 5).map((bar) => (
                <div
                  key={bar._id}
                  className="flex items-center justify-between p-4 bg-white/[0.04] rounded-xl"
                >
                  <div>
                    <p className="font-medium text-white">{bar.name}</p>
                    <p className="text-sm text-gray-400">
                      {bar.city || 'Ingen by'}
                      {bar.category && ` · ${bar.category}`}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      bar.active !== false
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {bar.active !== false ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-bodega-surface rounded-2xl p-6 border border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white mb-4">Hurtige Handlinger</h2>
          <div className="space-y-3">
            <Link
              href="/admin/bars"
              className="flex items-center justify-center gap-2 w-full p-4 bg-bodega-accent text-white rounded-xl hover:bg-bodega-accent/90 transition-colors font-medium"
            >
              <MapPin className="w-5 h-5" />
              Administrer Barer
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full p-4 bg-white/[0.06] text-white rounded-xl hover:bg-white/[0.1] transition-colors font-medium"
            >
              <Star className="w-5 h-5" />
              Se Offentlig Side
            </Link>
          </div>
        </div>
      </div>

      {Object.keys(categoryCount).length > 0 && (
        <div className="bg-bodega-surface rounded-2xl p-6 border border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white mb-4">Barer efter Kategori</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryCount).map(([category, count]) => (
              <div key={category} className="p-4 bg-white/[0.04] rounded-xl">
                <p className="text-sm font-medium text-gray-400">{category}</p>
                <p className="text-2xl font-semibold text-white mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
