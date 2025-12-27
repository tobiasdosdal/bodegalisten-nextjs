# Bodegalisten - Next.js Migration

A modern React/Next.js remake of the Bodegalisten map locator application with TanStack Query and SQLite.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Data Visualization**: Leaflet.js
- **Database**: SQLite (using better-sqlite3)
- **Tables**: TanStack Table (React Table)
- **Auth**: NextAuth.js
- **Hosting**: Vercel
- **i18n**: next-i18next

## Project Structure

```
bodegalisten-nextjs/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── maps/         # Map endpoints
│   │   ├── auth/         # Authentication
│   │   └── health/       # Health check
│   ├── viewer/           # Map viewer pages
│   ├── admin/            # Admin dashboard
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── providers.tsx     # Context providers
├── components/           # Reusable React components
│   ├── ui/              # shadcn/ui components
│   ├── map/             # Map-related components
│   └── admin/           # Admin components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
├── types/               # TypeScript type definitions
├── styles/              # Global CSS
└── public/              # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Environment variables setup

### Installation

1. Clone the repository
```bash
cd bodegalisten-nextjs
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Initialize SQLite database
```bash
sqlite3 bodegalisten.db < lib/db-schema.sql
```

5. Run development server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Development

### Create API Routes

API routes are in `app/api/`. Each route should:
- Handle both GET/POST/PUT/DELETE as needed
- Return proper HTTP status codes
- Include error handling
- Use parameterized queries to prevent SQL injection

### Add Components

1. Create component in `components/` directory
2. Use shadcn/ui components for consistency
3. Add TypeScript types
4. Use Tailwind CSS for styling

### Database Queries

Use the helper functions from `lib/db.ts`:

```typescript
import { queryOne, queryMany, execute } from '@/lib/db'

// Single result
const map = queryOne<Map>('SELECT * FROM maps WHERE id = ?', [id])

// Multiple results
const markers = queryMany<Marker>('SELECT * FROM markers WHERE map_id = ?', [mapId])

// Execute (INSERT/UPDATE/DELETE)
execute('DELETE FROM maps WHERE id = ?', [id])
```

### Use React Query

```typescript
import { useMap, useMaps, useCreateMap } from '@/hooks/useMap'

// Fetching data
const { data: map, isLoading, error } = useMap(code)

// Mutations
const createMap = useCreateMap()
await createMap.mutateAsync({ name: 'New Map', code: 'map-001' })
```

## Deployment

### Vercel

The application is configured for Vercel deployment:

```bash
npm run build
vercel deploy
```

### Environment Variables (Production)

Set the following in Vercel dashboard:
- `DATABASE_URL` - SQLite file path (or file path for persistent storage)
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Production URL

## Features

- [x] Map viewer with Leaflet.js
- [x] Multi-marker support
- [x] SQLite database
- [x] TanStack Query for data management
- [ ] Admin dashboard
- [ ] User authentication
- [ ] Multi-language support
- [ ] PWA capabilities
- [ ] Performance optimizations
- [ ] SEO optimization

## API Endpoints

### Maps
- `GET /api/maps` - List all maps
- `POST /api/maps` - Create a map
- `GET /api/maps/[code]` - Get specific map
- `PUT /api/maps/[code]` - Update map
- `DELETE /api/maps/[code]` - Delete map

### Markers
- `GET /api/maps/[code]/markers` - List markers for a map
- `POST /api/maps/[code]/markers` - Create marker
- `PUT /api/maps/[code]/markers/[id]` - Update marker
- `DELETE /api/maps/[code]/markers/[id]` - Delete marker

## Database Schema

See `lib/db-schema.sql` for complete schema including:
- Maps
- Markers
- Map Settings
- Users
- Sessions
- Verification Tokens

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT
