# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

To run a single test file:
```bash
npm test Button.test.tsx
npm test -- Button.test.tsx --watch  # watch a single file
```

## Architecture Overview

**Bodegalisten** is a Next.js 16 + React 19 map-based location discovery app (bars/restaurants) migrated from PHP.

### Tech Stack
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS + shadcn/ui components
- TanStack Query v5 for data fetching, TanStack Table v8 for data tables
- Leaflet.js (OpenStreetMap) for maps
- SQLite (better-sqlite3) database
- Clerk authentication
- i18n: Danish (da) and English (en)

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `app/api/` - REST API endpoints (`/maps`, `/maps/[code]/markers`, `/admin/markers`)
- `app/admin/` - Protected admin dashboard (maps/markers CRUD)
- `components/ui/` - shadcn/ui components
- `components/map/` - Leaflet map components (client-only, use `ssr: false`)
- `hooks/useMap.ts` - TanStack Query hooks for all data operations
- `lib/db.ts` - SQLite database helpers (`queryOne`, `queryMany`, `execute`, `transaction`)
- `types/index.ts` - Core TypeScript types (`Map`, `Marker`, `User`, `ApiResponse`)

### Data Flow
1. React components → TanStack Query hooks (`hooks/useMap.ts`)
2. Hooks use `apiClient` (`lib/api-client.ts`) for HTTP requests
3. API routes (`app/api/`) handle requests with database operations
4. Database layer (`lib/db.ts`) executes SQLite queries

### API Response Pattern
All API routes return: `{ success: true, data: T }` or `{ success: false, error: string }`

### Database Helpers
```typescript
import { queryOne, queryMany, execute, transaction } from '@/lib/db'

queryOne<Map>('SELECT * FROM maps WHERE code = ?', [code])  // single or null
queryMany<Marker>('SELECT * FROM markers WHERE map_id = ?', [mapId])  // array
execute('DELETE FROM markers WHERE id = ?', [id])  // returns changes count
```

### TanStack Query Pattern
Query keys are hierarchical: `['map', code]`, `['markers', code]`, `['maps']`
Mutations auto-invalidate relevant queries on success.

### Map Components
Leaflet components require dynamic import with `ssr: false`:
```typescript
const MapWithSidebar = dynamic(
  () => import('@/components/map/MapWithSidebar').then((mod) => mod.MapWithSidebar),
  { ssr: false }
)
```

### Auth
- Clerk authentication configured in `app/providers.tsx`
- Route protection via `middleware.ts` (protects `/admin` routes)
- API routes check auth: `const { userId } = await auth()`

### i18n
- Translations in `public/locales/{da,en}/common.json`
- Use `useTranslation()` hook from `lib/i18n`
- Default locale: Danish (da)

### Styling
- Use `cn()` from `lib/utils.ts` for conditional class merging
- Dark mode via class-based toggle (CSS variables in `styles/globals.css`)

## Visual Development

### Design Principles
- Comprehensive design checklist in `/context/design-principles.md`
- Brand style guide in `/context/style-guide.md`
- When making visual (front-end, UI/UX) changes, always refer to these files for guidance

### Quick Visual Check
IMMEDIATELY after implementing any front-end change:
1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/context/design-principles.md` and `/context/style-guide.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__playwright__browser_console_messages`

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review
Invoke the `@agent-design-review` subagent for thorough design validation when:
- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing
