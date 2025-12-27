import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByBar = query({
  args: { barId: v.id("bars") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_bar", (q) => q.eq("barId", args.barId))
      .collect();
  },
});

export const getStats = query({
  args: { barId: v.id("bars") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_bar", (q) => q.eq("barId", args.barId))
      .collect();

    if (reviews.length === 0) {
      return { count: 0, avgRating: 0, smoking: null, priceLevel: null };
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const smokingCounts: Record<number, number> = {};
    const priceCounts: Record<string, number> = {};

    reviews.forEach((r) => {
      if (r.smoking !== undefined) {
        smokingCounts[r.smoking] = (smokingCounts[r.smoking] || 0) + 1;
      }
      if (r.priceLevel) {
        priceCounts[r.priceLevel] = (priceCounts[r.priceLevel] || 0) + 1;
      }
    });

    const smoking = Object.entries(smokingCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const priceLevel = Object.entries(priceCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      count: reviews.length,
      avgRating: Math.round(avgRating * 10) / 10,
      smoking: smoking !== undefined ? Number(smoking) === 1 : null,
      priceLevel: priceLevel ? Number(priceLevel) : null,
    };
  },
});

export const create = mutation({
  args: {
    barId: v.id("bars"),
    rating: v.number(),
    comment: v.optional(v.string()),
    smoking: v.optional(v.number()),
    priceLevel: v.optional(v.string()),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reviews", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const reviews = await ctx.db.query("reviews").collect();

    // Get bar names for each review
    const reviewsWithBars = await Promise.all(
      reviews.map(async (review) => {
        const bar = await ctx.db.get(review.barId);
        return {
          ...review,
          barName: bar?.name || "Ukendt bar",
        };
      })
    );

    return reviewsWithBars;
  },
});

export const remove = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const importByBarName = mutation({
  args: {
    barName: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
    smoking: v.optional(v.number()),
    priceLevel: v.optional(v.string()),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Find bar by exact name match
    const bars = await ctx.db.query("bars").collect();
    const bar = bars.find(b => b.name === args.barName);

    if (!bar) {
      throw new Error(`Bar not found: ${args.barName}`);
    }

    const { barName, ...reviewData } = args;
    return await ctx.db.insert("reviews", {
      ...reviewData,
      barId: bar._id,
    });
  },
});
