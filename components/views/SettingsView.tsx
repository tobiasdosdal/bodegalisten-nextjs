'use client'

import { MapPin, Car, PersonStanding, Bike, Globe, PlusCircle, ExternalLink } from 'lucide-react'

interface SettingsViewProps {
  maxDistance: number
  transportType: 'car' | 'walk' | 'bike'
  onMaxDistanceChange: (value: number) => void
  onTransportTypeChange: (value: 'car' | 'walk' | 'bike') => void
}

export function SettingsView({
  maxDistance,
  transportType,
  onMaxDistanceChange,
  onTransportTypeChange,
}: SettingsViewProps) {
  return (
    <div className="flex flex-col h-full bg-black">
      <header className="flex-shrink-0 px-4 lg:px-8 pt-14 lg:pt-8 pb-4 lg:pb-6 lg:max-w-xl lg:mx-auto lg:w-full">
        <h1 className="text-3xl lg:text-3xl font-bold font-bodega-rounded text-white">
          Indstillinger
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 lg:px-8 pb-4 hide-scrollbar space-y-4 lg:space-y-6 lg:max-w-xl lg:mx-auto lg:w-full">
        <SettingsGroup>
          <SettingsRow
            icon={<MapPin className="w-4 h-4" />}
            iconColor="bg-blue-500"
            title="Søgeradius"
            subtitle={`${maxDistance} km`}
          >
            <input
              type="range"
              min={1}
              max={20}
              value={maxDistance}
              onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
              className="w-32 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-bodega-accent"
            />
          </SettingsRow>

          <SettingsDivider />

          <SettingsRow
            icon={<PersonStanding className="w-4 h-4" />}
            iconColor="bg-green-500"
            title="Transport"
          >
            <div className="flex gap-1 bg-bodega-surface-elevated rounded-xl p-1">
              <TransportButton
                active={transportType === 'car'}
                onClick={() => onTransportTypeChange('car')}
                icon={<Car />}
              />
              <TransportButton
                active={transportType === 'walk'}
                onClick={() => onTransportTypeChange('walk')}
                icon={<PersonStanding />}
              />
              <TransportButton
                active={transportType === 'bike'}
                onClick={() => onTransportTypeChange('bike')}
                icon={<Bike />}
              />
            </div>
          </SettingsRow>
        </SettingsGroup>

        {transportType === 'car' && (
          <div className="flex items-center gap-2 px-4 py-2 text-orange-400 text-bodega-caption animate-in fade-in slide-in-from-top-2">
            <span className="text-xs">⚠️</span>
            <span>Kør ikke, hvis du har drukket</span>
          </div>
        )}

        <SettingsGroup>
          <SettingsLinkRow
            icon={<Globe className="w-4 h-4" />}
            iconColor="bg-bodega-accent"
            title="tyndfed.dk"
            href="https://tyndfed.dk"
          />
          <SettingsDivider />
          <SettingsLinkRow
            icon={<PlusCircle className="w-4 h-4" />}
            iconColor="bg-bodega-accent"
            title="Rapporter manglende bar"
            href="https://bodegalisten.dk"
          />
        </SettingsGroup>

        <div className="text-center text-bodega-caption text-gray-500 pt-4">
          Version 1.0
        </div>
      </main>
    </div>
  )
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bodega-surface rounded-bodega-md border border-white/[0.04] overflow-hidden">
      {children}
    </div>
  )
}

interface SettingsRowProps {
  icon: React.ReactNode
  iconColor: string
  title: string
  subtitle?: string
  children?: React.ReactNode
}

function SettingsRow({ icon, iconColor, title, subtitle, children }: SettingsRowProps) {
  return (
    <div className="flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3 lg:py-4">
      <div className={`w-7 h-7 lg:w-9 lg:h-9 rounded-md ${iconColor} bg-opacity-15 flex items-center justify-center text-current`}>
        <span className={`${iconColor.replace('bg-', 'text-')} [&>svg]:lg:w-5 [&>svg]:lg:h-5`}>{icon}</span>
      </div>
      <div className="flex-1">
        <div className="text-bodega-body lg:text-lg text-white">{title}</div>
        {subtitle && (
          <div className="text-bodega-caption lg:text-sm text-gray-500">{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  )
}

function SettingsLinkRow({
  icon,
  iconColor,
  title,
  href
}: {
  icon: React.ReactNode
  iconColor: string
  title: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3 lg:py-4 hover:bg-white/[0.02] lg:hover:bg-white/[0.04] transition-colors"
    >
      <div className={`w-7 h-7 lg:w-9 lg:h-9 rounded-md ${iconColor} bg-opacity-15 flex items-center justify-center`}>
        <span className={`${iconColor.replace('bg-', 'text-')} [&>svg]:lg:w-5 [&>svg]:lg:h-5`}>{icon}</span>
      </div>
      <span className="flex-1 text-bodega-body lg:text-lg text-white">{title}</span>
      <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4 text-gray-500" />
    </a>
  )
}

function SettingsDivider() {
  return <div className="h-px bg-white/[0.06] ml-14 lg:ml-[68px]" />
}

interface TransportButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
}

function TransportButton({ active, onClick, icon }: TransportButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-11 lg:w-14 lg:h-12 flex items-center justify-center rounded-lg transition-all active:scale-95 ${
        active
          ? 'bg-bodega-accent text-white shadow-lg shadow-bodega-accent/20'
          : 'text-gray-400 active:text-white'
      } [&>svg]:w-5 [&>svg]:h-5 [&>svg]:lg:w-6 [&>svg]:lg:h-6`}
    >
      {icon}
    </button>
  )
}
