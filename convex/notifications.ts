import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Distance threshold for "nearby" (in km)
const NEARBY_THRESHOLD_KM = 2;

// Calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Update user location
export const updateLocation = mutation({
  args: {
    userId: v.string(),
    lat: v.number(),
    lon: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userLocations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lat: args.lat,
        lon: args.lon,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("userLocations", {
      userId: args.userId,
      lat: args.lat,
      lon: args.lon,
      updatedAt: Date.now(),
    });
  },
});

// Get unread notifications for a user
export const getUnread = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", args.userId).eq("read", false)
      )
      .order("desc")
      .take(20);
  },
});

// Get all notifications for a user
export const getAll = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    // Hydrate with fromUser profiles
    return Promise.all(
      notifications.map(async (notification) => {
        let fromUser = null;
        if (notification.fromUserId) {
          const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_clerk_id", (q) =>
              q.eq("clerkId", notification.fromUserId!)
            )
            .first();
          if (profile) {
            fromUser = {
              displayName: profile.displayName,
              avatarUrl: profile.avatarUrl,
            };
          }
        }
        return { ...notification, fromUser };
      })
    );
  },
});

// Get unread count
export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();
    return unread.length;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
  },
});

// Mark all as read
export const markAllAsRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { read: true });
    }
  },
});

// Create notification for nearby friends when someone checks in
export const notifyNearbyFriends = internalMutation({
  args: {
    checkInUserId: v.string(),
    checkInUserName: v.string(),
    barId: v.string(),
    barName: v.string(),
    barLat: v.number(),
    barLon: v.number(),
  },
  handler: async (ctx, args) => {
    // Get followers of the check-in user
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.checkInUserId))
      .collect();

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    let notified = 0;

    for (const follower of followers) {
      // Get follower's location
      const location = await ctx.db
        .query("userLocations")
        .withIndex("by_user", (q) => q.eq("userId", follower.followerId))
        .first();

      if (!location) continue;

      // Check if location is recent
      if (location.updatedAt < oneHourAgo) continue;

      // Calculate distance
      const distance = calculateDistance(
        location.lat,
        location.lon,
        args.barLat,
        args.barLon
      );

      if (distance <= NEARBY_THRESHOLD_KM) {
        // Create notification
        await ctx.db.insert("notifications", {
          userId: follower.followerId,
          type: "friend_checkin",
          title: `${args.checkInUserName} er i nærheden!`,
          body: `Tjekket ind på ${args.barName} (${distance.toFixed(1)} km væk)`,
          url: `/?bar=${args.barId}`,
          fromUserId: args.checkInUserId,
          read: false,
          createdAt: now,
        });
        notified++;
      }
    }

    return { notified };
  },
});

// Create a generic notification
export const create = internalMutation({
  args: {
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
    fromUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      body: args.body,
      url: args.url,
      fromUserId: args.fromUserId,
      read: false,
      createdAt: Date.now(),
    });
  },
});
