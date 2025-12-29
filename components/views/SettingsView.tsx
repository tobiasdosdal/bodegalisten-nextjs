'use client'

import { MapPin, Car, PersonStanding, Bike, Globe, PlusCircle, ExternalLink, AlertTriangle, Settings } from 'lucide-react'

interface SettingsViewProps {
  maxDistance: number
  transportType: 'car' | 'walk' | 'bike'
  onMaxDistanceChange: (value: number) => void
  onTransportTypeChange: (value: 'car' | 'walk' | 'bike') => void
  showHeader?: boolean
}

export function SettingsView({
  maxDistance,
  transportType,
  onMaxDistanceChange,
  onTransportTypeChange,
  showHeader = true,
}: SettingsViewProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      {showHeader && (
        <header className="flex-shrink-0 px-4 lg:px-8 pt-14 lg:pt-8 pb-4 lg:pb-6 lg:max-w-2xl lg:mx-auto lg:w-full">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-stone-500/15 flex items-center justify-center border border-stone-500/25">
              <Settings className="w-5 h-5 text-stone-400" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-display font-semibold text-bodega-cream tracking-tight">
              Indstillinger
            </h1>
          </div>
          <p className="text-sm text-stone-500 ml-[52px]">
            Tilpas din oplevelse
          </p>
        </header>
      )}

      <main className="flex-1 overflow-y-auto px-4 lg:px-8 pb-8 hide-scrollbar space-y-4 lg:space-y-6 lg:max-w-2xl lg:mx-auto lg:w-full">
        <SettingsGroup title="Søgning">
          <SettingsRow
            icon={<MapPin className="w-4 h-4" />}
            iconColor="blue"
            title="Søgeradius"
            subtitle={`${maxDistance} km omkring dig`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-500 w-6 text-right">1</span>
              <input
                type="range"
                min={1}
                max={20}
                value={maxDistance}
                onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
                className="w-24 lg:w-32 h-2 bg-stone-700 rounded-full appearance-none cursor-pointer accent-bodega-gold"
              />
              <span className="text-xs text-stone-500 w-6">20</span>
            </div>
          </SettingsRow>

          <SettingsDivider />

          <SettingsRow
            icon={<PersonStanding className="w-4 h-4" />}
            iconColor="green"
            title="Transport"
            subtitle="Hvordan kommer du derhen?"
          >
            <div className="flex gap-1 bg-stone-800/50 rounded-xl p-1 border border-stone-700/50">
              <TransportButton
                active={transportType === 'car'}
                onClick={() => onTransportTypeChange('car')}
                icon={<Car />}
                label="Bil"
              />
              <TransportButton
                active={transportType === 'walk'}
                onClick={() => onTransportTypeChange('walk')}
                icon={<PersonStanding />}
                label="Gå"
              />
              <TransportButton
                active={transportType === 'bike'}
                onClick={() => onTransportTypeChange('bike')}
                icon={<Bike />}
                label="Cykel"
              />
            </div>
          </SettingsRow>
        </SettingsGroup>

        {transportType === 'car' && (
          <div className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 border border-orange-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-sm text-orange-300">Kør ikke, hvis du har drukket</span>
          </div>
        )}

        <SettingsGroup title="Links">
          <SettingsLinkRow
            icon={<Globe className="w-4 h-4" />}
            iconColor="amber"
            title="tyndfed.dk"
            subtitle="Vores hovedside"
            href="https://tyndfed.dk"
          />
          <SettingsDivider />
          <SettingsLinkRow
            icon={<PlusCircle className="w-4 h-4" />}
            iconColor="green"
            title="Rapporter manglende bar"
            subtitle="Hjælp os med at blive bedre"
            href="https://bodegalisten.dk"
          />
        </SettingsGroup>

        <div className="text-center pt-6 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-bodega-surface rounded-full border border-bodega-gold/10">
            <span className="text-lg">🍺</span>
            <span className="text-xs text-stone-500">Bodegalisten v1.0</span>
          </div>
        </div>
      </main>
    </div>
  )
}

function SettingsGroup({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div>
      {title && (
        <h3 className="text-xs font-semibold text-bodega-cream uppercase tracking-wide mb-2 px-1">
          {title}
        </h3>
      )}
      <div className="bg-bodega-surface rounded-2xl border border-bodega-gold/10 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

interface SettingsRowProps {
  icon: React.ReactNode
  iconColor: 'blue' | 'green' | 'amber' | 'red' | 'stone'
  title: string
  subtitle?: string
  children?: React.ReactNode
}

const iconColors = {
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/25' },
  green: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/25' },
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/25' },
  red: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/25' },
  stone: { bg: 'bg-stone-500/15', text: 'text-stone-400', border: 'border-stone-500/25' },
}

function SettingsRow({ icon, iconColor, title, subtitle, children }: SettingsRowProps) {
  const colors = iconColors[iconColor]
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 lg:py-4">
      <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-xl ${colors.bg} flex items-center justify-center border ${colors.border}`}>
        <span className={`${colors.text} [&>svg]:w-4 [&>svg]:h-4 [&>svg]:lg:w-5 [&>svg]:lg:h-5`}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm lg:text-base font-medium text-bodega-cream">{title}</div>
        {subtitle && (
          <div className="text-xs lg:text-sm text-stone-500">{subtitle}</div>
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
  subtitle,
  href
}: {
  icon: React.ReactNode
  iconColor: 'blue' | 'green' | 'amber' | 'red' | 'stone'
  title: string
  subtitle?: string
  href: string
}) {
  const colors = iconColors[iconColor]
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3.5 lg:py-4 hover:bg-bodega-gold/5 transition-colors"
    >
      <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-xl ${colors.bg} flex items-center justify-center border ${colors.border}`}>
        <span className={`${colors.text} [&>svg]:w-4 [&>svg]:h-4 [&>svg]:lg:w-5 [&>svg]:lg:h-5`}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm lg:text-base font-medium text-bodega-cream">{title}</div>
        {subtitle && (
          <div className="text-xs lg:text-sm text-stone-500">{subtitle}</div>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-stone-600" />
    </a>
  )
}

function SettingsDivider() {
  return <div className="h-px bg-stone-800/80 ml-[60px] lg:ml-[68px]" />
}

interface TransportButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function TransportButton({ active, onClick, icon, label }: TransportButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 lg:px-4 lg:py-2.5 flex items-center justify-center gap-1.5 rounded-lg transition-all active:scale-95 ${
        active
          ? 'bg-gradient-to-r from-bodega-gold to-amber-500 text-bodega-primary font-semibold shadow-lg shadow-amber-500/20'
          : 'text-stone-400 hover:text-bodega-cream'
      } [&>svg]:w-4 [&>svg]:h-4 [&>svg]:lg:w-5 [&>svg]:lg:h-5`}
    >
      {icon}
      <span className="text-xs lg:text-sm hidden sm:inline">{label}</span>
    </button>
  )
}
