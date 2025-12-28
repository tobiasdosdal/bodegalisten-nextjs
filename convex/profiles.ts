import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getPublicProfile = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!profile) return null;

    // Return limited info if profile is private
    if (!profile.isPublic) {
      return {
        _id: profile._id,
        clerkId: profile.clerkId,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        isPublic: false,
      };
    }

    return profile;
  },
});

export const getProfileStats = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const [reviews, checkIns, photos, followers, following, favorites] =
      await Promise.all([
        ctx.db.query("reviews").collect(),
        ctx.db
          .query("checkIns")
          .withIndex("by_user", (q) => q.eq("userId", args.clerkId))
          .collect(),
        ctx.db
          .query("photos")
          .withIndex("by_user", (q) => q.eq("userId", args.clerkId))
          .collect(),
        ctx.db
          .query("follows")
          .withIndex("by_following", (q) => q.eq("followingId", args.clerkId))
          .collect(),
        ctx.db
          .query("follows")
          .withIndex("by_follower", (q) => q.eq("followerId", args.clerkId))
          .collect(),
        ctx.db
          .query("favorites")
          .withIndex("by_user", (q) => q.eq("userId", args.clerkId))
          .collect(),
      ]);

    // Filter reviews by userId
    const userReviews = reviews.filter((r) => r.userId === args.clerkId);

    return {
      reviewCount: userReviews.length,
      checkInCount: checkIns.length,
      photoCount: photos.length,
      followerCount: followers.length,
      followingCount: following.length,
      favoriteCount: favorites.length,
    };
  },
});

export const createOrUpdate = mutation({
  args: {
    clerkId: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    favoriteBarId: v.optional(v.id("bars")),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName,
        bio: args.bio,
        avatarUrl: args.avatarUrl,
        favoriteBarId: args.favoriteBarId,
        isPublic: args.isPublic ?? existing.isPublic,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("userProfiles", {
      clerkId: args.clerkId,
      displayName: args.displayName,
      bio: args.bio,
      avatarUrl: args.avatarUrl,
      favoriteBarId: args.favoriteBarId,
      isPublic: args.isPublic ?? true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateAvatar = mutation({
  args: {
    clerkId: v.string(),
    avatarUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    await ctx.db.patch(profile._id, {
      avatarUrl: args.avatarUrl,
      updatedAt: Date.now(),
    });
  },
});

export const updatePrivacy = mutation({
  args: {
    clerkId: v.string(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    await ctx.db.patch(profile._id, {
      isPublic: args.isPublic,
      updatedAt: Date.now(),
    });
  },
});

// Update last active timestamp (call this on app activity)
export const updateLastActive = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        lastActiveAt: Date.now(),
      });
    }
  },
});

// Helper constants for online status
const ACTIVE_NOW_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const RECENTLY_ACTIVE_THRESHOLD = 60 * 60 * 1000; // 1 hour

// Get online status for a user
export const getOnlineStatus = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!profile || !profile.lastActiveAt) {
      return { status: "unknown", lastActiveAt: null };
    }

    const now = Date.now();
    const diff = now - profile.lastActiveAt;

    if (diff < ACTIVE_NOW_THRESHOLD) {
      return { status: "active", lastActiveAt: profile.lastActiveAt };
    } else if (diff < RECENTLY_ACTIVE_THRESHOLD) {
      return { status: "recent", lastActiveAt: profile.lastActiveAt };
    } else {
      return { status: "away", lastActiveAt: profile.lastActiveAt };
    }
  },
});

// Search users by display name
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const searchQuery = args.query.toLowerCase().trim();

    if (searchQuery.length < 2) {
      return [];
    }

    // Get all public profiles (Convex doesn't have full-text search, so we filter in memory)
    const allProfiles = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();

    const now = Date.now();

    // Filter by name match and add online status
    const matches = allProfiles
      .filter((profile) =>
        profile.displayName.toLowerCase().includes(searchQuery)
      )
      .slice(0, limit)
      .map((profile) => ({
        clerkId: profile.clerkId,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        lastActiveAt: profile.lastActiveAt,
        isOnline: profile.lastActiveAt
          ? now - profile.lastActiveAt < ACTIVE_NOW_THRESHOLD
          : false,
      }));

    // Sort by online status, then by name
    return matches.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return a.displayName.localeCompare(b.displayName);
    });
  },
});
