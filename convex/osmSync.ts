import { query, mutation, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const OVERPASS_API = "https://overpass-api.de/api/interpreter";

const REGIONS = [
  { name: "København", bbox: "55.6,12.45,55.75,12.65" },
  { name: "Aarhus", bbox: "56.1,10.1,56.22,10.25" },
  { name: "Odense", bbox: "55.35,10.3,55.45,10.45" },
  { name: "Aalborg", bbox: "57.0,9.85,57.1,10.05" },
  { name: "Esbjerg", bbox: "55.45,8.4,55.5,8.5" },
  { name: "Randers", bbox: "56.45,10.0,56.5,10.1" },
  { name: "Horsens", bbox: "55.85,9.8,55.9,9.9" },
  { name: "Roskilde", bbox: "55.62,12.05,55.67,12.12" },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildQuery(bbox: string): string {
  return `[out:json][timeout:25];node["amenity"~"bar|pub"](${bbox});out;`;
}

interface OsmElement {
  type: "node" | "way";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    "addr:street"?: string;
    "addr:city"?: string;
    "addr:housenumber"?: string;
  };
}

interface OsmResponse {
  elements: OsmElement[];
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const BATCH_SIZE = 10;

export const syncDenmark = action({
  args: {},
  handler: async (ctx): Promise<{ found: number; processed: number; regions: number; error?: string }> => {
    let totalFound = 0;
    let totalProcessed = 0;
    let regionsCompleted = 0;
    const errors: string[] = [];

    for (let idx = 0; idx < REGIONS.length; idx++) {
      const region = REGIONS[idx];
      
      if (idx > 0) {
        await delay(3000);
      }
      
      try {
        const query = buildQuery(region.bbox);
        const response = await fetch(OVERPASS_API, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "data=" + encodeURIComponent(query),
        });

        if (!response.ok) {
          errors.push(`${region.name}: HTTP ${response.status}`);
          continue;
        }

        const data: OsmResponse = await response.json();
        const elements = data.elements.filter((el) => el.tags?.name);

        const osmBars = elements.map((el) => ({
          osmId: el.id,
          osmType: el.type,
          name: el.tags!.name!,
          lat: el.lat ?? 0,
          lon: el.lon ?? 0,
          address: el.tags?.["addr:street"]
            ? `${el.tags["addr:street"]} ${el.tags["addr:housenumber"] || ""}`.trim()
            : undefined,
          city: el.tags?.["addr:city"] || region.name,
        }));

        for (let i = 0; i < osmBars.length; i += BATCH_SIZE) {
          const batch = osmBars.slice(i, i + BATCH_SIZE);
          await ctx.runMutation(internal.osmSync.processOsmBatch, { osmBars: batch });
        }

        totalFound += elements.length;
        totalProcessed += osmBars.length;
        regionsCompleted++;
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown";
        errors.push(`${region.name}: ${msg}`);
      }
    }

    return {
      found: totalFound,
      processed: totalProcessed,
      regions: regionsCompleted,
      error: errors.length > 0 ? errors.join(", ") : undefined,
    };
  },
});

export const processOsmBatch = internalMutation({
  args: {
    osmBars: v.array(
      v.object({
        osmId: v.number(),
        osmType: v.string(),
        name: v.string(),
        lat: v.number(),
        lon: v.number(),
        address: v.optional(v.string()),
        city: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existingBars = await ctx.db.query("bars").collect();
    const existingOsmBars = await ctx.db.query("osmBars").collect();
    const existingOsmIds = new Set(existingOsmBars.map((b) => b.osmId));
    const now = Date.now();

    for (const osmBar of args.osmBars) {
      if (existingOsmIds.has(osmBar.osmId)) {
        const existing = existingOsmBars.find((b) => b.osmId === osmBar.osmId);
        if (existing) {
          await ctx.db.patch(existing._id, { lastSeenAt: now });
        }
        continue;
      }

      const matchedBar = findMatch(osmBar, existingBars);

      await ctx.db.insert("osmBars", {
        ...osmBar,
        matchedBarId: matchedBar?._id,
        status: matchedBar ? "matched" : "new",
        discoveredAt: now,
        lastSeenAt: now,
      });

      if (matchedBar && !matchedBar.osmId) {
        await ctx.db.patch(matchedBar._id, { osmId: osmBar.osmId });
      }
    }
  },
});

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "aa")
    .replace(/é/g, "e")
    .replace(/è/g, "e")
    .replace(/ê/g, "e")
    .replace(/ë/g, "e")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ä/g, "a")
    .replace(/[''`´]/g, "")
    .replace(/[&+]/g, " and ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function removeCommonPrefixes(name: string): string {
  const prefixes = [
    "cafe ", "café ", "bar ", "pub ", "bodega ", "restaurant ",
    "the ", "den ", "det ", "de ", "et ", "en ",
  ];
  let result = name;
  for (const prefix of prefixes) {
    if (result.startsWith(prefix)) {
      result = result.slice(prefix.length);
    }
  }
  return result;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function nameSimilarity(name1: string, name2: string): number {
  const n1 = removeCommonPrefixes(normalizeName(name1));
  const n2 = removeCommonPrefixes(normalizeName(name2));

  if (n1 === n2) return 1.0;
  if (n1.includes(n2) || n2.includes(n1)) return 0.9;

  const maxLen = Math.max(n1.length, n2.length);
  if (maxLen === 0) return 0;

  const distance = levenshteinDistance(n1, n2);
  return 1 - distance / maxLen;
}

function findMatch(
  osmBar: { osmId: number; name: string; lat: number; lon: number },
  existingBars: Array<{
    _id: Id<"bars">;
    name: string;
    lat: number;
    lon: number;
    osmId?: number;
  }>
) {
  for (const bar of existingBars) {
    if (bar.osmId === osmBar.osmId) return bar;
  }

  let bestMatch: (typeof existingBars)[0] | null = null;
  let bestScore = 0;

  for (const bar of existingBars) {
    const distance = haversineDistance(bar.lat, bar.lon, osmBar.lat, osmBar.lon);

    if (distance > 100) continue;

    const similarity = nameSimilarity(bar.name, osmBar.name);

    if (distance <= 50 && similarity >= 0.85) {
      const score = similarity * (1 - distance / 100);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = bar;
      }
    } else if (distance <= 30 && similarity >= 0.7) {
      const score = similarity * (1 - distance / 100);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = bar;
      }
    }
  }

  return bestMatch;
}

export const getNewBars = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("osmBars")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .collect();
  },
});

export const getMissingBars = query({
  args: {},
  handler: async (ctx) => {
    const bars = await ctx.db
      .query("bars")
      .filter((q) => q.neq(q.field("active"), false))
      .collect();

    const osmBars = await ctx.db.query("osmBars").collect();
    const matchedBarIds = new Set(
      osmBars.filter((o) => o.matchedBarId).map((o) => o.matchedBarId)
    );

    return bars.filter((bar) => !matchedBarIds.has(bar._id) && !bar.osmId);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const osmBars = await ctx.db.query("osmBars").collect();
    const bars = await ctx.db
      .query("bars")
      .filter((q) => q.neq(q.field("active"), false))
      .collect();

    const newCount = osmBars.filter((b) => b.status === "new").length;
    const matchedCount = osmBars.filter((b) => b.status === "matched").length;
    const importedCount = osmBars.filter((b) => b.status === "imported").length;
    const ignoredCount = osmBars.filter((b) => b.status === "ignored").length;

    const matchedBarIds = new Set(
      osmBars.filter((o) => o.matchedBarId).map((o) => o.matchedBarId)
    );
    const missingCount = bars.filter(
      (bar) => !matchedBarIds.has(bar._id) && !bar.osmId
    ).length;

    return {
      new: newCount,
      matched: matchedCount,
      imported: importedCount,
      ignored: ignoredCount,
      missing: missingCount,
      totalOsm: osmBars.length,
      totalBars: bars.length,
    };
  },
});

export const importOsmBar = mutation({
  args: { osmBarId: v.id("osmBars") },
  handler: async (ctx, args) => {
    const osmBar = await ctx.db.get(args.osmBarId);
    if (!osmBar) throw new Error("OSM bar not found");
    if (osmBar.status !== "new") throw new Error("OSM bar already processed");

    const newBarId = await ctx.db.insert("bars", {
      name: osmBar.name,
      lat: osmBar.lat,
      lon: osmBar.lon,
      street: osmBar.address,
      city: osmBar.city,
      osmId: osmBar.osmId,
      active: true,
    });

    await ctx.db.patch(args.osmBarId, {
      status: "imported",
      matchedBarId: newBarId,
    });

    return newBarId;
  },
});

export const ignoreOsmBar = mutation({
  args: { osmBarId: v.id("osmBars") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.osmBarId, { status: "ignored" });
  },
});

export const linkOsmBar = mutation({
  args: {
    osmBarId: v.id("osmBars"),
    barId: v.id("bars"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.osmBarId, {
      status: "matched",
      matchedBarId: args.barId,
    });
    await ctx.db.patch(args.barId, {
      osmId: (await ctx.db.get(args.osmBarId))?.osmId,
    });
  },
});

export const markBarMissing = mutation({
  args: { barId: v.id("bars") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.barId, { active: false });
  },
});
