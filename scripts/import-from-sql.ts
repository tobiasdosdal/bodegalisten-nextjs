import { ConvexHttpClient } from "convex/browser";
import { readFileSync } from "fs";
import path from "path";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://descriptive-dachshund-566.convex.cloud";

interface ParsedMarker {
  id: number;
  lat: number;
  lon: number;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  website: string;
  phone: string;
  hours: string;
  description: string;
  active: number;
}

function parseValue(val: string): string {
  if (val === "NULL" || val === "") return "";
  // Remove surrounding quotes
  if (val.startsWith("'") && val.endsWith("'")) {
    val = val.slice(1, -1);
  }
  // Unescape single quotes
  return val.replace(/''/g, "'").replace(/\\'/g, "'");
}

// Simpler parsing approach - just extract the key fields
function extractMarkersSimple(sqlContent: string): ParsedMarker[] {
  const markers: ParsedMarker[] = [];
  
  // Match each VALUES tuple - simpler approach
  const tupleRegex = /\((\d+),\s*1,\s*'([\d.]+)',\s*'([\d.]+)',\s*'([^']+)'/g;
  
  let match;
  while ((match = tupleRegex.exec(sqlContent)) !== null) {
    // Now find the rest of the data for this entry
    // Find the full tuple starting from this match
    const startIdx = match.index;
    let depth = 0;
    let endIdx = startIdx;
    
    for (let i = startIdx; i < sqlContent.length && i < startIdx + 10000; i++) {
      if (sqlContent[i] === '(') depth++;
      if (sqlContent[i] === ')') depth--;
      if (depth === 0 && sqlContent[i] === ')') {
        endIdx = i + 1;
        break;
      }
    }
    
    const fullTuple = sqlContent.slice(startIdx, endIdx);
    
    // Extract specific fields using positions
    const fields = [];
    let inQuote = false;
    let current = '';
    let fieldIdx = 0;
    
    for (let i = 1; i < fullTuple.length - 1; i++) {
      const char = fullTuple[i];
      
      if (char === "'" && fullTuple[i-1] !== '\\') {
        inQuote = !inQuote;
        current += char;
      } else if (char === ',' && !inQuote) {
        fields.push(current.trim());
        current = '';
        fieldIdx++;
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    
    // Field positions (0-indexed):
    // 0: id, 1: id_map, 2: lat, 3: lon, 4: name, 5: type, 6: link,
    // 7: street, 8: city, 9: county, 10: state, 11: postal_code, 12: country,
    // 13: website, 14: website_caption, 15: email, 16: phone, 17: whatsapp,
    // 18: hours, 19: description, ... many more ..., 107: active
    
    const marker: ParsedMarker = {
      id: parseInt(fields[0]) || 0,
      lat: parseFloat(fields[2]?.replace(/'/g, '')) || 0,
      lon: parseFloat(fields[3]?.replace(/'/g, '')) || 0,
      name: parseValue(fields[4] || ''),
      street: parseValue(fields[7] || ''),
      city: parseValue(fields[8] || ''),
      postalCode: parseValue(fields[11] || ''),
      country: parseValue(fields[12] || ''),
      website: parseValue(fields[13] || ''),
      phone: parseValue(fields[16] || ''),
      hours: parseValue(fields[18] || ''),
      description: parseValue(fields[19] || ''),
      active: parseInt(fields[107]) || 1,
    };
    
    if (marker.name && marker.lat && marker.lon) {
      markers.push(marker);
    }
  }
  
  return markers;
}

function makeKey(name: string, lat: number, lon: number): string {
  return `${name.toLowerCase().trim()}|${lat.toFixed(6)}|${lon.toFixed(6)}`;
}

async function importToConvex() {
  console.log("=== SQL to Convex Import (with deduplication) ===");
  console.log(`Convex URL: ${CONVEX_URL}`);
  
  const sqlPath = path.join(process.cwd(), "tobiasdo_bodega3.sql");
  console.log(`Reading: ${sqlPath}`);
  
  const sqlContent = readFileSync(sqlPath, "utf-8");
  console.log(`SQL file size: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);
  
  console.log("\nParsing markers...");
  const markers = extractMarkersSimple(sqlContent);
  console.log(`Found ${markers.length} markers in SQL`);
  
  if (markers.length === 0) {
    console.log("No markers found! Check SQL parsing.");
    return;
  }
  
  const convex = new ConvexHttpClient(CONVEX_URL);
  
  console.log("\nFetching existing bars from Convex...");
  const existingBars = await convex.query("bars:list" as never) as Array<{name: string, lat: number, lon: number}>;
  console.log(`Found ${existingBars.length} existing bars in Convex`);
  
  const existingKeys = new Set<string>();
  for (const bar of existingBars) {
    existingKeys.add(makeKey(bar.name, bar.lat, bar.lon));
  }
  
  const newMarkers = markers.filter(m => {
    const key = makeKey(m.name, m.lat, m.lon);
    return !existingKeys.has(key) && m.active;
  });
  
  console.log(`\nNew markers to import: ${newMarkers.length}`);
  
  if (newMarkers.length === 0) {
    console.log("All markers already imported!");
    return;
  }
  
  console.log("\nSample new markers:");
  newMarkers.slice(0, 5).forEach(m => {
    console.log(`  - ${m.name} (${m.lat}, ${m.lon}) - ${m.city}`);
  });
  
  console.log("\nImporting to Convex...");
  let imported = 0;
  let errors = 0;
  
  for (const marker of newMarkers) {
    try {
      await convex.mutation("bars:create" as never, {
        name: marker.name,
        lat: marker.lat,
        lon: marker.lon,
        street: marker.street || undefined,
        city: marker.city || undefined,
        postalCode: marker.postalCode || undefined,
        phone: marker.phone || undefined,
        website: marker.website || undefined,
        hours: marker.hours || undefined,
        description: marker.description || undefined,
      } as never);
      imported++;
      
      if (imported % 10 === 0) {
        console.log(`  Imported ${imported}/${newMarkers.length}...`);
      }
    } catch (err) {
      errors++;
      if (errors <= 5) {
        console.error(`  Error: "${marker.name}":`, (err as Error).message?.slice(0, 100));
      }
    }
  }
  
  console.log("\n=== Import Complete ===");
  console.log(`Previously in Convex: ${existingBars.length}`);
  console.log(`Newly imported: ${imported}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total now: ${existingBars.length + imported}`);
}

importToConvex().catch(console.error);
