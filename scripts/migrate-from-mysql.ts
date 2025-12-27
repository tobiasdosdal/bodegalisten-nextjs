import { ConvexHttpClient } from "convex/browser";
import mysql from "mysql2/promise";

const MYSQL_CONFIG = {
  host: "localhost",
  database: "tobiasdo_bodega3",
  user: "tobiasdo_bodegalisten",
  password: "VE!={5!EjKP!",
};

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

async function migrate() {
  console.log("Connecting to MySQL...");
  
  const connection = await mysql.createConnection(MYSQL_CONFIG);
  const convex = new ConvexHttpClient(CONVEX_URL);

  try {
    console.log("Fetching markers from MySQL...");
    const [markers] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT 
        id,
        lat,
        lon,
        name,
        street,
        city,
        postal_code,
        country,
        website,
        email,
        phone,
        hours,
        description,
        active
      FROM sml_markers 
      WHERE active = 1
    `);

    console.log(`Found ${markers.length} markers`);

    console.log("Importing to Convex...");
    let imported = 0;
    let errors = 0;

    for (const marker of markers) {
      try {
        await convex.mutation("bars:create" as any, {
          name: marker.name || "Unknown",
          lat: parseFloat(marker.lat) || 0,
          lon: parseFloat(marker.lon) || 0,
          street: marker.street || undefined,
          city: marker.city || undefined,
          postalCode: marker.postal_code || undefined,
          phone: marker.phone || undefined,
          website: marker.website || undefined,
          hours: marker.hours || undefined,
          description: marker.description || undefined,
        });
        imported++;
        if (imported % 10 === 0) {
          console.log(`Imported ${imported}/${markers.length}`);
        }
      } catch (err) {
        console.error(`Error importing "${marker.name}":`, err);
        errors++;
      }
    }

    console.log("\n--- Migration Complete ---");
    console.log(`Imported: ${imported}`);
    console.log(`Errors: ${errors}`);

    console.log("\nFetching reviews from MySQL...");
    const [reviews] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT 
        r.id,
        r.id_marker,
        r.rating,
        r.comment,
        r.create_date,
        r.email,
        r.name as reviewer_name
      FROM sml_reviews r
      INNER JOIN sml_markers m ON r.id_marker = m.id
      WHERE m.active = 1
    `);

    console.log(`Found ${reviews.length} reviews`);
    console.log("Note: Reviews require bar IDs from Convex. Run a second pass after bars are imported.");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await connection.end();
  }
}

migrate();
