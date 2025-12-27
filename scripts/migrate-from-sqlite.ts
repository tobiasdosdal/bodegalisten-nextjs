import { ConvexHttpClient } from "convex/browser";
import Database from "better-sqlite3";
import path from "path";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://descriptive-dachshund-566.convex.cloud";

interface MarkerRow {
  id: number;
  map_id: number;
  name: string;
  lat: number;
  lon: number;
  description: string | null;
  category: string | null;
  icon: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  hours: string | null;
  active: number;
  featured: number;
  created_at: string;
  updated_at: string;
}

async function migrate() {
  console.log("=== SQLite to Convex Migration ===");
  console.log(`Convex URL: ${CONVEX_URL}`);

  const dbPath = path.join(process.cwd(), "bodegalisten.db");
  console.log(`SQLite DB: ${dbPath}`);

  const db = new Database(dbPath);
  const convex = new ConvexHttpClient(CONVEX_URL);

  try {
    // Get all markers from SQLite
    const markers = db.prepare(`
      SELECT * FROM markers WHERE active = 1
    `).all() as MarkerRow[];

    console.log(`Found ${markers.length} markers in SQLite`);

    if (markers.length === 0) {
      console.log("No markers to migrate!");
      return;
    }

    console.log("\nMigrating to Convex...");
    let imported = 0;
    let errors = 0;

    for (const marker of markers) {
      try {
        await convex.mutation("bars:create" as never, {
          name: marker.name || "Unknown",
          lat: marker.lat,
          lon: marker.lon,
          street: marker.street || undefined,
          city: marker.city || undefined,
          postalCode: marker.postal_code || undefined,
          phone: marker.phone || undefined,
          website: marker.website || undefined,
          hours: marker.hours || undefined,
          description: marker.description || undefined,
          category: marker.category || undefined,
        } as never);
        imported++;
        console.log(`  [${imported}/${markers.length}] ${marker.name}`);
      } catch (err) {
        console.error(`  ERROR: "${marker.name}":`, err);
        errors++;
      }
    }

    console.log("\n=== Migration Complete ===");
    console.log(`Imported: ${imported}`);
    console.log(`Errors: ${errors}`);

  } finally {
    db.close();
  }
}

migrate().catch(console.error);
