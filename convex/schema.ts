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
  }).index("by_city", ["city"]),

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
});
