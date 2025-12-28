import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Record an activity when a social action occurs
export const recordActivity = internalMutation({
  args: {
    userId: v.string(),
    type: v.string(),
    barId: v.id("bars"),
    referenceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      userId: args.userId,
      type: args.type,
      barId: args.barId,
      referenceId: args.referenceId,
      createdAt: Date.now(),
    });
  },
});

// Get personal feed (activities from users you follow + your own)
export const getPersonalFeed = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    // Get users this person follows
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    const followingIds = following.map((f) => f.followingId);
    // Include own activities
    followingIds.push(args.userId);

    // Get activities from all followed users
    const allActivities = await Promise.all(
      followingIds.map((id) =>
        ctx.db
          .query("activities")
          .withIndex("by_user_recent", (q) => q.eq("userId", id))
          .order("desc")
          .take(limit)
      )
    );

    // Merge and sort by createdAt
    const merged = allActivities
      .flat()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    // Hydrate with user profiles and bar details
    return hydrateActivities(ctx, merged);
  },
});

// Get public/discover feed (recent activities from public profiles)
export const getPublicFeed = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    // Get recent activities
    const activities = await ctx.db
      .query("activities")
      .order("desc")
      .take(limit * 2); // Fetch extra to filter private profiles

    // Get public profiles
    const publicProfiles = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();

    const publicUserIds = new Set(publicProfiles.map((p) => p.clerkId));

    // Filter to only public profiles
    const publicActivities = activities
      .filter((a) => publicUserIds.has(a.userId))
      .slice(0, limit);

    return hydrateActivities(ctx, publicActivities);
  },
});

// Get activities for a specific user
export const getUserActivities = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const activities = await ctx.db
      .query("activities")
      .withIndex("by_user_recent", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return hydrateActivities(ctx, activities);
  },
});

// Get activities for a specific bar
export const getBarActivities = query({
  args: {
    barId: v.id("bars"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    // Get all activities and filter by barId
    const allActivities = await ctx.db.query("activities").order("desc").take(100);

    const barActivities = allActivities
      .filter((a) => a.barId === args.barId)
      .slice(0, limit);

    return hydrateActivities(ctx, barActivities);
  },
});

// Helper to hydrate activities with user and bar details
async function hydrateActivities(
  ctx: any,
  activities: Array<{
    _id: any;
    userId: string;
    type: string;
    barId: any;
    referenceId?: string;
    createdAt: number;
  }>
) {
  return Promise.all(
    activities.map(async (activity) => {
      // Get user profile
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", activity.userId))
        .first();

      // Get bar details
      const bar = await ctx.db.get(activity.barId);

      // Get type-specific data
      let data: Record<string, any> = {};

      if (activity.type === "review" && activity.referenceId) {
        const review = await ctx.db.get(activity.referenceId as any);
        if (review) {
          data.rating = review.rating;
          data.comment = review.comment;
        }
      }

      if (activity.type === "photo" && activity.referenceId) {
        const photo = await ctx.db.get(activity.referenceId as any);
        if (photo) {
          const url = await ctx.storage.getUrl(photo.storageId);
          data.photoUrl = url;
          data.caption = photo.caption;
        }
      }

      if (activity.type === "checkin" && activity.referenceId) {
        const checkIn = await ctx.db.get(activity.referenceId as any);
        if (checkIn) {
          data.message = checkIn.message;
        }
      }

      return {
        ...activity,
        user: profile
          ? {
              clerkId: profile.clerkId,
              displayName: profile.displayName,
              avatarUrl: profile.avatarUrl,
            }
          : {
              clerkId: activity.userId,
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
        data,
      };
    })
  );
}
