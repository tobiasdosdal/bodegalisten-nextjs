import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Default check-in duration: 4 hours
const CHECK_IN_DURATION_MS = 4 * 60 * 60 * 1000;

// Get active check-ins at a specific bar
export const getActiveByBar = query({
  args: { barId: v.id("bars") },
  handler: async (ctx, args) => {
    const now = Date.now();

    const checkIns = await ctx.db
      .query("checkIns")
      .withIndex("by_bar", (q) => q.eq("barId", args.barId))
      .collect();

    // Filter to only active (not expired) and public check-ins
    const activeCheckIns = checkIns.filter(
      (c) => c.expiresAt > now && c.visibility === "public"
    );

    // Hydrate with user profiles
    return Promise.all(
      activeCheckIns.map(async (checkIn) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", checkIn.userId))
          .first();

        return {
          ...checkIn,
          user: profile
            ? {
                clerkId: profile.clerkId,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
              }
            : {
                clerkId: checkIn.userId,
                displayName: "Anonym",
                avatarUrl: null,
              },
        };
      })
    );
  },
});

// Get a user's current active check-in
export const getActiveByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();

    const checkIns = await ctx.db
      .query("checkIns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Find the most recent non-expired check-in
    const active = checkIns
      .filter((c) => c.expiresAt > now)
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    if (!active) return null;

    // Get bar details
    const bar = await ctx.db.get(active.barId);

    return {
      ...active,
      bar: bar
        ? {
            _id: bar._id,
            name: bar.name,
            city: bar.city,
          }
        : null,
    };
  },
});

// Get a user's check-in history
export const getUserHistory = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const checkIns = await ctx.db
      .query("checkIns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    // Hydrate with bar details
    return Promise.all(
      checkIns.map(async (checkIn) => {
        const bar = await ctx.db.get(checkIn.barId);
        return {
          ...checkIn,
          bar: bar
            ? {
                _id: bar._id,
                name: bar.name,
                city: bar.city,
              }
            : null,
        };
      })
    );
  },
});

// Get active check-ins from users you follow
export const getFriendsActive = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get users this person follows
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    const followingIds = new Set(following.map((f) => f.followingId));

    // Get all active public check-ins
    const allCheckIns = await ctx.db.query("checkIns").collect();

    const friendCheckIns = allCheckIns.filter(
      (c) =>
        c.expiresAt > now &&
        c.visibility === "public" &&
        followingIds.has(c.userId)
    );

    // Hydrate with user and bar details
    return Promise.all(
      friendCheckIns.map(async (checkIn) => {
        const [profile, bar] = await Promise.all([
          ctx.db
            .query("userProfiles")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", checkIn.userId))
            .first(),
          ctx.db.get(checkIn.barId),
        ]);

        return {
          ...checkIn,
          user: profile
            ? {
                clerkId: profile.clerkId,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
              }
            : {
                clerkId: checkIn.userId,
                displayName: "Anonym",
                avatarUrl: null,
              },
          bar: bar
            ? {
                _id: bar._id,
                name: bar.name,
                city: bar.city,
              }
            : null,
        };
      })
    );
  },
});

// Create a new check-in
export const create = mutation({
  args: {
    userId: v.string(),
    barId: v.id("bars"),
    message: v.optional(v.string()),
    visibility: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const visibility = args.visibility ?? "public";

    // Remove any existing active check-ins for this user
    const existingCheckIns = await ctx.db
      .query("checkIns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const activeCheckIns = existingCheckIns.filter((c) => c.expiresAt > now);

    for (const checkIn of activeCheckIns) {
      await ctx.db.delete(checkIn._id);
    }

    // Create new check-in
    const checkInId = await ctx.db.insert("checkIns", {
      userId: args.userId,
      barId: args.barId,
      message: args.message,
      visibility,
      expiresAt: now + CHECK_IN_DURATION_MS,
      createdAt: now,
    });

    // Record activity if public
    if (visibility === "public") {
      await ctx.db.insert("activities", {
        userId: args.userId,
        type: "checkin",
        barId: args.barId,
        referenceId: checkInId,
        createdAt: now,
      });
    }

    return checkInId;
  },
});

// Remove a check-in (check out)
export const remove = mutation({
  args: { checkInId: v.id("checkIns") },
  handler: async (ctx, args) => {
    const checkIn = await ctx.db.get(args.checkInId);

    if (checkIn) {
      await ctx.db.delete(args.checkInId);

      // Also remove the activity
      const activities = await ctx.db
        .query("activities")
        .withIndex("by_user", (q) => q.eq("userId", checkIn.userId))
        .collect();

      const activity = activities.find(
        (a) => a.type === "checkin" && a.referenceId === String(args.checkInId)
      );

      if (activity) {
        await ctx.db.delete(activity._id);
      }
    }
  },
});

// Cleanup expired check-ins (called by cron)
export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const expiredCheckIns = await ctx.db
      .query("checkIns")
      .withIndex("by_expires")
      .collect();

    const toDelete = expiredCheckIns.filter((c) => c.expiresAt < now);

    for (const checkIn of toDelete) {
      await ctx.db.delete(checkIn._id);
    }

    return { deleted: toDelete.length };
  },
});
