import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get bar details for each favorite
    const favoritesWithBars = await Promise.all(
      favorites.map(async (fav) => {
        const bar = await ctx.db.get(fav.barId);
        return {
          ...fav,
          bar: bar
            ? {
                _id: bar._id,
                name: bar.name,
                city: bar.city,
                street: bar.street,
              }
            : null,
        };
      })
    );

    return favoritesWithBars.filter((f) => f.bar !== null);
  },
});

export const isFavorite = query({
  args: {
    userId: v.string(),
    barId: v.id("bars"),
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_both", (q) =>
        q.eq("userId", args.userId).eq("barId", args.barId)
      )
      .first();

    return favorite !== null;
  },
});

export const getFavoriteCount = query({
  args: { barId: v.id("bars") },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_bar", (q) => q.eq("barId", args.barId))
      .collect();

    return favorites.length;
  },
});

export const add = mutation({
  args: {
    userId: v.string(),
    barId: v.id("bars"),
  },
  handler: async (ctx, args) => {
    // Check if already favorited
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_both", (q) =>
        q.eq("userId", args.userId).eq("barId", args.barId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    const favoriteId = await ctx.db.insert("favorites", {
      userId: args.userId,
      barId: args.barId,
      createdAt: Date.now(),
    });

    // Record activity
    await ctx.db.insert("activities", {
      userId: args.userId,
      type: "favorite",
      barId: args.barId,
      referenceId: favoriteId,
      createdAt: Date.now(),
    });

    return favoriteId;
  },
});

export const remove = mutation({
  args: {
    userId: v.string(),
    barId: v.id("bars"),
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_both", (q) =>
        q.eq("userId", args.userId).eq("barId", args.barId)
      )
      .first();

    if (favorite) {
      await ctx.db.delete(favorite._id);

      // Also remove the activity for this favorite
      const activities = await ctx.db
        .query("activities")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();

      const activity = activities.find(
        (a) => a.type === "favorite" && a.referenceId === String(favorite._id)
      );

      if (activity) {
        await ctx.db.delete(activity._id);
      }
    }
  },
});

export const toggle = mutation({
  args: {
    userId: v.string(),
    barId: v.id("bars"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_both", (q) =>
        q.eq("userId", args.userId).eq("barId", args.barId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);

      // Remove activity
      const activities = await ctx.db
        .query("activities")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();

      const activity = activities.find(
        (a) => a.type === "favorite" && a.referenceId === String(existing._id)
      );

      if (activity) {
        await ctx.db.delete(activity._id);
      }

      return false;
    }

    const favoriteId = await ctx.db.insert("favorites", {
      userId: args.userId,
      barId: args.barId,
      createdAt: Date.now(),
    });

    // Record activity
    await ctx.db.insert("activities", {
      userId: args.userId,
      type: "favorite",
      barId: args.barId,
      referenceId: favoriteId,
      createdAt: Date.now(),
    });

    return true;
  },
});
