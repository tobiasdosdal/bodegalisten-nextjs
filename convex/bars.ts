import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bars").filter((q) => q.neq(q.field("active"), false)).collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bars").collect();
  },
});

export const getById = query({
  args: { id: v.id("bars") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const bars = await ctx.db.query("bars").collect();
    const q = args.query.toLowerCase();
    return bars.filter(
      (bar) =>
        bar.name.toLowerCase().includes(q) ||
        bar.street?.toLowerCase().includes(q) ||
        bar.city?.toLowerCase().includes(q)
    );
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bars", { ...args, active: true });
  },
});

export const update = mutation({
  args: {
    id: v.id("bars"),
    name: v.optional(v.string()),
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    lat: v.optional(v.number()),
    lon: v.optional(v.number()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    hours: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("bars") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { active: false });
  },
});

export const hardDelete = mutation({
  args: { id: v.id("bars") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
