# Getting Started - Bodegalisten Next.js

Complete guide to get the application running locally.

## Prerequisites

Ensure you have installed:
- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 13+** ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

## Step 1: Install Dependencies

```bash
cd bodegalisten-nextjs
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- TanStack Query & Table
- Leaflet.js
- Tailwind CSS & shadcn/ui
- PostgreSQL driver
- NextAuth.js
- And more...

## Step 2: Configure Database

### Option A: Local PostgreSQL

**Create the database:**
```bash
createdb bodegalisten
```

**Initialize the schema:**
```bash
psql bodegalisten < lib/db-schema.sql
```

**Verify the schema:**
```bash
psql bodegalisten -c "\dt"
```

### Option B: Remote PostgreSQL (e.g., AWS RDS, Supabase, Railway)

You'll get a connection string that looks like:
```
postgresql://user:password@host:port/database
```

## Step 3: Environment Variables

Create `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Database URL
# For local: postgresql://postgres:password@localhost:5432/bodegalisten
# For remote: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://user:password@localhost:5432/bodegalisten

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Map Configuration
NEXT_PUBLIC_MAP_DEFAULT_CENTER_LAT=55.6761
NEXT_PUBLIC_MAP_DEFAULT_CENTER_LNG=12.5683
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=12

# Feature Flags
NEXT_PUBLIC_PWA_ENABLED=true
NEXT_PUBLIC_MULTI_LANGUAGE=true
```

### Generate NEXTAUTH_SECRET:
```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Minimum 0 -Maximum 256} | ForEach-Object {[byte]$_}))
```

## Step 4: Verify Database Connection

Test your connection:
```bash
psql $DATABASE_URL -c "SELECT version();"
```

Check tables were created:
```bash
psql $DATABASE_URL -c "\dt"
```

## Step 5: Run Development Server

```bash
npm run dev
```

You should see:
```
> Local:        http://localhost:3000
> Environments: .env.local
```

Visit **http://localhost:3000** in your browser.

## Step 6: Insert Test Data (Optional)

```bash
psql bodegalisten << 'EOF'

-- Insert a test map
INSERT INTO maps (code, name, description, active, language)
VALUES ('test-map-001', 'Test Restaurant Map', 'Sample map with test locations', true, 'en');

-- Insert test markers
INSERT INTO markers (map_id, name, latitude, longitude, address, description, active)
VALUES 
(1, 'Restaurant A', 55.6761, 12.5683, '123 Main St, Copenhagen', 'Great Italian food', true),
(1, 'Cafe B', 55.6800, 12.5750, '456 Side St, Copenhagen', 'Best coffee in town', true),
(1, 'Bar C', 55.6720, 12.5620, '789 Street Ave, Copenhagen', 'Cozy pub atmosphere', true);

EOF
```

Then visit: **http://localhost:3000/viewer?code=test-map-001**

## Common Issues

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

### Database Connection Error
Check your `DATABASE_URL` in `.env.local`:
```bash
psql $DATABASE_URL -c "SELECT 1"
```

### Modules Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Leaflet Map Not Displaying
Ensure `app/globals.css` has:
```css
.leaflet-container {
  height: 100%;
  width: 100%;
}
```

## Project Structure

```
bodegalisten-nextjs/
├── app/
│   ├── api/              # API routes
│   ├── viewer/           # Map viewer
│   ├── admin/            # Admin dashboard (coming soon)
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/           # React components
│   ├── ui/              # shadcn components
│   └── map/             # Map-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities
│   ├── db.ts           # Database access
│   ├── api-client.ts   # HTTP client
│   └── db-schema.sql   # Database schema
├── types/               # TypeScript types
├── styles/              # CSS files
└── public/              # Static assets
```

## Available Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix
```

## Next Steps

1. **Add a Map**: Create your first map via API or (coming soon) admin UI
2. **Add Markers**: Add location markers to your map
3. **Customize**: Modify styles and components to match your brand
4. **Deploy**: Deploy to Vercel when ready

## Useful Tools

### React Query DevTools
Automatically included in development:
- **Shortcut**: Ctrl/Cmd + Shift + Q
- Shows query status, cache, and network requests

### PostgreSQL Client
```bash
# Connect to database
psql bodegalisten

# List all tables
\dt

# Describe a table
\d maps

# See sample data
SELECT * FROM maps LIMIT 5;
```

## Database Queries

### Get All Maps
```sql
SELECT * FROM maps WHERE active = true;
```

### Get Markers for a Map
```sql
SELECT * FROM markers WHERE map_id = 1 AND active = true;
```

### Count Markers per Map
```sql
SELECT map_id, COUNT(*) as marker_count 
FROM markers 
GROUP BY map_id;
```

## Documentation

- [Implementation Status](./IMPLEMENTATION_STATUS.md)
- [README](./README.md)
- [API Documentation](./README.md#api-endpoints)
- [Database Schema](./lib/db-schema.sql)

## Support

For issues or questions:
1. Check [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md#troubleshooting)
2. Review [README.md](./README.md)
3. Check Next.js [documentation](https://nextjs.org/docs)

## Ready?

```bash
npm run dev
# Visit http://localhost:3000
```

Happy coding! 🚀
