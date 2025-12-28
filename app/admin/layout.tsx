'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, Home, ArrowLeft, Star, Users, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/bars', label: 'Barer', icon: MapPin },
  { href: '/admin/bar-health', label: 'Bar Health', icon: Activity },
  { href: '/admin/reviews', label: 'Anmeldelser', icon: Star },
  { href: '/admin/users', label: 'Brugere', icon: Users },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-black">
      <aside className="w-64 bg-bodega-surface border-r border-white/[0.06]">
        <div className="p-6 border-b border-white/[0.06]">
          <h1 className="text-xl font-bold text-white font-bodega-rounded">Bodegalisten</h1>
          <p className="text-sm text-gray-400">Admin Dashboard</p>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                  isActive
                    ? 'bg-bodega-accent text-white'
                    : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-white/[0.06]">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tilbage til siden
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-black">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
