# PROJECT KNOWLEDGE BASE

**Generated:** 2025-12-28
**Commit:** 2a9e052
**Branch:** main

## OVERVIEW

Bar/bodega discovery PWA with map interface. Next.js 16 + React 19 + Convex backend + Clerk auth. Migrated from PHP, dual database architecture (Convex primary, SQLite legacy).

## STRUCTURE

```
bodegalisten-nextjs/
├── app/                # Next.js App Router (standard structure)
├── components/
│   ├── bodega/         # Bar cards, reviews, loading states
│   ├── views/          # Full-page views (MapView, ListView, Settings)
│   ├── layout/         # Navigation (TabBar, DesktopSidebar)
│   ├── social/         # FavoriteButton, FollowButton, profiles
│   ├── checkin/        # Check-in functionality
│   ├── photos/         # Photo upload/gallery
│   └── ui/             # shadcn/ui (standard)
├── convex/             # ← PRIMARY BACKEND (see convex/AGENTS.md)
├── hooks/              # useGeolocation, useMap, usePWA, useSettings
├── lib/
│   ├── i18n/           # Custom i18n (NOT next-i18next)
│   └── db.ts           # SQLite helpers (LEGACY, prefer Convex)
├── public/locales/     # {da,en}/common.json translations
└── scripts/            # Migration scripts (one-time use)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add bar feature | `convex/bars.ts` | Convex mutation/query |
| Add social feature | `convex/` + `components/social/` | follows, favorites, profiles |
| Add UI component | `components/bodega/` or `components/views/` | Use existing patterns |
| Change navigation | `components/layout/TabBar.tsx` + `DesktopSidebar.tsx` | Keep in sync |
| Add translation | `public/locales/{da,en}/common.json` | Danish primary |
| Modify map | `components/views/BodegaMapView.tsx` | Leaflet, dynamic import |

## CONVENTIONS

- **API Response**: `{ success: true, data }` or `{ success: false, error }` (legacy routes only)
- **Convex**: Use Convex hooks directly in components, NOT TanStack Query for Convex data
- **Map imports**: Always `dynamic(() => import(...), { ssr: false })` for Leaflet
- **Design tokens**: Use `bodega-*` classes (see `tailwind.config.ts`)
- **i18n hook**: `useTranslation()` from `lib/i18n`, NOT next-i18next

## ANTI-PATTERNS (THIS PROJECT)

| Pattern | Why Bad | Instead |
|---------|---------|---------|
| `lib/auth.ts` | Deprecated | Use Clerk directly |
| next-i18next | Unused, wrong setup | `lib/i18n/` custom implementation |
| New SQLite queries | Legacy system | Use Convex functions |
| TanStack Query for Convex | Redundant | Use `useQuery(api.x.y)` directly |
| `as any`, `@ts-ignore` | Strict mode | Fix types properly |

## UNIQUE STYLES

- **Bodega design system**: Custom colors, spacing, shadows in Tailwind
  - Colors: `bodega-primary`, `bodega-accent`, `bodega-surface`
  - Shadows: `shadow-bodega-card`, `shadow-bodega-glow`
- **Mobile-first**: TabBar bottom nav, DesktopSidebar left nav
- **Danish-first**: Default locale `da`, cookie-based persistence

## COMMANDS

```bash
npm run dev              # Next.js + Convex dev servers
npm run build            # convex:generate && next build
npm test                 # Jest with Danish locale mocks
npx convex dev           # Convex backend only
npx convex deploy        # Deploy Convex to production
```

## DUAL BACKEND ARCHITECTURE

```
┌─────────────────┐     ┌─────────────────┐
│  Convex (NEW)   │     │  SQLite (OLD)   │
│  - bars         │     │  - maps         │
│  - reviews      │     │  - markers      │
│  - favorites    │     │  - admin CRUD   │
│  - follows      │     │                 │
│  - checkIns     │     │                 │
│  - photos       │     │                 │
└─────────────────┘     └─────────────────┘
     useQuery()              fetch()
```

**Convex** = real-time, social features, new development
**SQLite** = legacy map/marker data, admin routes (migration incomplete)

## NOTES

- **No middleware.ts**: Auth checked per-route, not globally
- **PWA**: Serwist integration, disabled in dev, service worker in `app/sw.ts`
- **Build requires Convex**: `convex:generate` must run before `next build`
- **Jest mocks**: `navigator.language = 'da'` in setup for i18n tests
- **Unused deps**: mysql2, postgres, axios, next-i18next (cleanup pending)
- **YAGNI reports**: See `docs/agent-outputs/yagni-checker/` for tech debt
