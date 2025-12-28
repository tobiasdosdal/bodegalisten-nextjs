'use client'

import { useState } from 'react'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import {
  RefreshCw,
  AlertCircle,
  MapPin,
  Check,
  X,
  ExternalLink,
  Clock,
  Plus,
  Ban,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'reports' | 'osm-new' | 'osm-missing'

export default function BarHealthPage() {
  const [activeTab, setActiveTab] = useState<Tab>('reports')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  const reportStats = useQuery(api.barReports.getStats)
  const osmStats = useQuery(api.osmSync.getStats)
  const syncDenmark = useAction(api.osmSync.syncDenmark)

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncResult(null)
    try {
      const result = await syncDenmark()
      if (result.error) {
        setSyncResult(`Fandt ${result.found} barer i ${result.regions} regioner. Fejl: ${result.error}`)
      } else {
        setSyncResult(`Fandt ${result.found} barer i ${result.regions} regioner`)
      }
    } catch (error) {
      setSyncResult('Sync fejlede')
    } finally {
      setIsSyncing(false)
    }
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'reports', label: 'Brugerrapporter', count: reportStats?.pending },
    { id: 'osm-new', label: 'Nye fra OSM', count: osmStats?.new },
    { id: 'osm-missing', label: 'Mangler i OSM', count: osmStats?.missing },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white font-bodega-rounded">Bar Health</h1>
          <p className="text-gray-400">Administrer bar-rapporter og OSM-synkronisering</p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2.5 bg-bodega-accent text-white font-medium rounded-xl hover:bg-bodega-accent/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-5 h-5', isSyncing && 'animate-spin')} />
          {isSyncing ? 'Synkroniserer...' : 'Sync med OSM'}
        </button>
      </div>

      {syncResult && (
        <div className="mb-6 p-4 rounded-xl bg-bodega-surface border border-white/[0.06]">
          <p className="text-gray-300">{syncResult}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Afventer rapporter"
          value={reportStats?.pending ?? 0}
          icon={<AlertCircle className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          label="Nye fra OSM"
          value={osmStats?.new ?? 0}
          icon={<Plus className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Mangler i OSM"
          value={osmStats?.missing ?? 0}
          icon={<Ban className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          label="Matchet"
          value={osmStats?.matched ?? 0}
          icon={<Check className="w-5 h-5" />}
          color="blue"
        />
      </div>

      <div className="bg-bodega-surface rounded-2xl border border-white/[0.06]">
        <div className="flex border-b border-white/[0.06]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-white border-b-2 border-bodega-accent'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-bodega-accent/20 text-bodega-accent">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'reports' && <UserReportsTab />}
          {activeTab === 'osm-new' && <OsmNewBarsTab />}
          {activeTab === 'osm-missing' && <OsmMissingBarsTab />}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: 'amber' | 'green' | 'red' | 'blue'
}) {
  const colors = {
    amber: 'bg-amber-500/20 text-amber-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    blue: 'bg-blue-500/20 text-blue-400',
  }

  return (
    <div className="bg-bodega-surface rounded-xl p-4 border border-white/[0.06]">
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', colors[color])}>{icon}</div>
        <div>
          <p className="text-2xl font-semibold text-white">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  )
}

function UserReportsTab() {
  const reports = useQuery(api.barReports.getPending)
  const approve = useMutation(api.barReports.approve)
  const reject = useMutation(api.barReports.reject)
  const [processing, setProcessing] = useState<string | null>(null)

  const handleApprove = async (reportId: Id<'barReports'>) => {
    setProcessing(reportId)
    try {
      await approve({ reportId, resolvedBy: 'admin' })
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (reportId: Id<'barReports'>) => {
    setProcessing(reportId)
    try {
      await reject({ reportId, resolvedBy: 'admin' })
    } finally {
      setProcessing(null)
    }
  }

  if (reports === undefined) {
    return <div className="text-gray-400">Indlæser...</div>
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Ingen afventende rapporter</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report._id}
          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {report.reportType === 'closed' ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">
                    Lukket
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                    Ny bar
                  </span>
                )}
                <span className="text-gray-500 text-sm">
                  {report.userName || 'Anonym'}
                </span>
                <span className="text-gray-600 text-sm">·</span>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(report.createdAt).toLocaleDateString('da-DK')}
                </span>
              </div>

              {report.reportType === 'closed' && report.bar && (
                <p className="text-white font-medium mb-1">
                  &quot;{report.bar.name}&quot; er lukket
                </p>
              )}

              {report.reportType === 'new_bar' && (
                <div className="mb-2">
                  <p className="text-white font-medium">{report.suggestedName}</p>
                  {report.suggestedAddress && (
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {report.suggestedAddress}
                    </p>
                  )}
                </div>
              )}

              {report.description && (
                <p className="text-gray-400 text-sm mt-2">&quot;{report.description}&quot;</p>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleApprove(report._id)}
                disabled={processing === report._id}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {report.reportType === 'closed' ? 'Marker lukket' : 'Tilføj bar'}
              </button>
              <button
                onClick={() => handleReject(report._id)}
                disabled={processing === report._id}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Afvis
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function OsmNewBarsTab() {
  const newBars = useQuery(api.osmSync.getNewBars)
  const importBar = useMutation(api.osmSync.importOsmBar)
  const ignoreBar = useMutation(api.osmSync.ignoreOsmBar)
  const [processing, setProcessing] = useState<string | null>(null)

  const handleImport = async (osmBarId: Id<'osmBars'>) => {
    setProcessing(osmBarId)
    try {
      await importBar({ osmBarId })
    } finally {
      setProcessing(null)
    }
  }

  const handleIgnore = async (osmBarId: Id<'osmBars'>) => {
    setProcessing(osmBarId)
    try {
      await ignoreBar({ osmBarId })
    } finally {
      setProcessing(null)
    }
  }

  if (newBars === undefined) {
    return <div className="text-gray-400">Indlæser...</div>
  }

  if (newBars.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Ingen nye barer fra OSM</p>
        <p className="text-sm mt-2">Tryk &quot;Sync med OSM&quot; for at søge</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {newBars.map((bar) => (
        <div
          key={bar._id}
          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-white font-medium">{bar.name}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                {bar.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {bar.address}
                  </span>
                )}
                {bar.city && <span>{bar.city}</span>}
                <a
                  href={`https://www.openstreetmap.org/${bar.osmType}/${bar.osmId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-bodega-accent hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  OSM
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleImport(bar._id)}
                disabled={processing === bar._id}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Importer
              </button>
              <button
                onClick={() => handleIgnore(bar._id)}
                disabled={processing === bar._id}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Ignorer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function OsmMissingBarsTab() {
  const missingBars = useQuery(api.osmSync.getMissingBars)
  const markMissing = useMutation(api.osmSync.markBarMissing)
  const [processing, setProcessing] = useState<string | null>(null)

  const handleMarkClosed = async (barId: Id<'bars'>) => {
    setProcessing(barId)
    try {
      await markMissing({ barId })
    } finally {
      setProcessing(null)
    }
  }

  if (missingBars === undefined) {
    return <div className="text-gray-400">Indlæser...</div>
  }

  if (missingBars.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Alle barer er matchet med OSM</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm mb-4">
        Disse barer findes i vores database men ikke i OpenStreetMap. De kan være lukket
        eller mangler i OSM.
      </p>
      {missingBars.map((bar) => (
        <div
          key={bar._id}
          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-white font-medium">{bar.name}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                {bar.street && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {bar.street}
                  </span>
                )}
                {bar.city && <span>{bar.city}</span>}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${bar.lat},${bar.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-bodega-accent hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Google Maps
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleMarkClosed(bar._id)}
                disabled={processing === bar._id}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                Marker lukket
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
