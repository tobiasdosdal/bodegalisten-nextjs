import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bars: defineTable({
    name: v.string(),
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    lat: v.number(),
    lon: v.number(),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    hours: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    active: v.optional(v.boolean()),
    osmId: v.optional(v.number()), // OpenStreetMap node/way ID
  }).index("by_city", ["city"]),

  // User reports for bar issues (closed bars, new bar suggestions)
  barReports: defineTable({
    barId: v.optional(v.id("bars")), // null for new bar suggestions
    reportType: v.string(), // "closed" | "new_bar"
    userId: v.string(), // Clerk ID
    userName: v.optional(v.string()),
    description: v.optional(v.string()),
    // For new bar suggestions
    suggestedName: v.optional(v.string()),
    suggestedLat: v.optional(v.number()),
    suggestedLon: v.optional(v.number()),
    suggestedAddress: v.optional(v.string()),
    // Status tracking
    status: v.string(), // "pending" | "approved" | "rejected"
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.string()),
    resolvedNote: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_bar", ["barId"]),

  // OSM discovered bars (staging table for review)
  osmBars: defineTable({
    osmId: v.number(), // OpenStreetMap node/way ID
    osmType: v.string(), // "node" | "way"
    name: v.string(),
    lat: v.number(),
    lon: v.number(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    matchedBarId: v.optional(v.id("bars")), // If matched to existing bar
    status: v.string(), // "new" | "matched" | "imported" | "ignored"
    discoveredAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_osm_id", ["osmId"])
    .index("by_status", ["status"]),

  reviews: defineTable({
    barId: v.id("bars"),
    rating: v.number(),
    comment: v.optional(v.string()),
    smoking: v.optional(v.number()),
    priceLevel: v.optional(v.string()),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_bar", ["barId"]),

  settings: defineTable({
    userId: v.string(),
    maxDistance: v.number(),
    transportType: v.string(),
  }).index("by_user", ["userId"]),

  // Social Features
  userProfiles: defineTable({
    clerkId: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    favoriteBarId: v.optional(v.id("bars")),
    isPublic: v.boolean(),
    lastActiveAt: v.optional(v.number()), // Track when user was last online
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  checkIns: defineTable({
    userId: v.string(),
    barId: v.id("bars"),
    message: v.optional(v.string()),
    visibility: v.string(), // "public" | "friends" | "private"
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_bar", ["barId"])
    .index("by_expires", ["expiresAt"]),

  follows: defineTable({
    followerId: v.string(),
    followingId: v.string(),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_both", ["followerId", "followingId"]),

  photos: defineTable({
    userId: v.string(),
    barId: v.id("bars"),
    storageId: v.id("_storage"),
    caption: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_bar", ["barId"])
    .index("by_user", ["userId"]),

  favorites: defineTable({
    userId: v.string(),
    barId: v.id("bars"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_bar", ["barId"])
    .index("by_both", ["userId", "barId"]),

  activities: defineTable({
    userId: v.string(),
    type: v.string(), // "checkin" | "review" | "photo" | "favorite"
    barId: v.id("bars"),
    referenceId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_recent", ["userId", "createdAt"]),

  // In-app notifications
  notifications: defineTable({
    userId: v.string(), // recipient
    type: v.string(), // "friend_checkin" | "new_follower" | etc
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
    fromUserId: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),

  // User locations for nearby notifications
  userLocations: defineTable({
    userId: v.string(),
    lat: v.number(),
    lon: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
