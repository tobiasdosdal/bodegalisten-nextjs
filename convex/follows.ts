import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getFollowers = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .collect();
  },
});

export const getFollowing = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();
  },
});

export const isFollowing = query({
  args: {
    followerId: v.string(),
    followingId: v.string(),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();

    return follow !== null;
  },
});

export const getFollowCounts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const [followers, following] = await Promise.all([
      ctx.db
        .query("follows")
        .withIndex("by_following", (q) => q.eq("followingId", args.userId))
        .collect(),
      ctx.db
        .query("follows")
        .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
        .collect(),
    ]);

    return {
      followers: followers.length,
      following: following.length,
    };
  },
});

export const follow = mutation({
  args: { targetUserId: v.string(), currentUserId: v.string() },
  handler: async (ctx, args) => {
    // Can't follow yourself
    if (args.currentUserId === args.targetUserId) {
      throw new Error("Cannot follow yourself");
    }

    // Check if already following
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q
          .eq("followerId", args.currentUserId)
          .eq("followingId", args.targetUserId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("follows", {
      followerId: args.currentUserId,
      followingId: args.targetUserId,
      createdAt: Date.now(),
    });
  },
});

export const unfollow = mutation({
  args: { targetUserId: v.string(), currentUserId: v.string() },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q
          .eq("followerId", args.currentUserId)
          .eq("followingId", args.targetUserId)
      )
      .first();

    if (follow) {
      await ctx.db.delete(follow._id);
    }
  },
});

export const toggle = mutation({
  args: { targetUserId: v.string(), currentUserId: v.string() },
  handler: async (ctx, args) => {
    if (args.currentUserId === args.targetUserId) {
      throw new Error("Cannot follow yourself");
    }

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q
          .eq("followerId", args.currentUserId)
          .eq("followingId", args.targetUserId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }

    await ctx.db.insert("follows", {
      followerId: args.currentUserId,
      followingId: args.targetUserId,
      createdAt: Date.now(),
    });

    return true;
  },
});
