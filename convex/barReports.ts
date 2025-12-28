import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    barId: v.optional(v.id("bars")),
    reportType: v.string(),
    userId: v.string(),
    userName: v.optional(v.string()),
    description: v.optional(v.string()),
    suggestedName: v.optional(v.string()),
    suggestedLat: v.optional(v.number()),
    suggestedLon: v.optional(v.number()),
    suggestedAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.reportType === "closed" && !args.barId) {
      throw new Error("barId is required for closed reports");
    }
    if (args.reportType === "new_bar" && !args.suggestedName) {
      throw new Error("suggestedName is required for new bar suggestions");
    }

    return await ctx.db.insert("barReports", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const getPending = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db
      .query("barReports")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const reportsWithBars = await Promise.all(
      reports.map(async (report) => {
        let bar = null;
        if (report.barId) {
          bar = await ctx.db.get(report.barId);
        }
        return { ...report, bar };
      })
    );

    return reportsWithBars;
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("barReports").collect();

    const pending = all.filter((r) => r.status === "pending").length;
    const approved = all.filter((r) => r.status === "approved").length;
    const rejected = all.filter((r) => r.status === "rejected").length;

    const closedReports = all.filter(
      (r) => r.reportType === "closed" && r.status === "pending"
    ).length;
    const newBarSuggestions = all.filter(
      (r) => r.reportType === "new_bar" && r.status === "pending"
    ).length;

    return { pending, approved, rejected, closedReports, newBarSuggestions };
  },
});

export const getByBar = query({
  args: { barId: v.id("bars") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("barReports")
      .withIndex("by_bar", (q) => q.eq("barId", args.barId))
      .collect();
  },
});

export const approve = mutation({
  args: {
    reportId: v.id("barReports"),
    resolvedBy: v.string(),
    resolvedNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found");

    await ctx.db.patch(args.reportId, {
      status: "approved",
      resolvedAt: Date.now(),
      resolvedBy: args.resolvedBy,
      resolvedNote: args.resolvedNote,
    });

    if (report.reportType === "closed" && report.barId) {
      await ctx.db.patch(report.barId, { active: false });
    }

    if (report.reportType === "new_bar" && report.suggestedName) {
      const newBarId = await ctx.db.insert("bars", {
        name: report.suggestedName,
        lat: report.suggestedLat!,
        lon: report.suggestedLon!,
        street: report.suggestedAddress,
        active: true,
      });
      return { action: "bar_created", barId: newBarId };
    }

    return { action: "bar_closed" };
  },
});

export const reject = mutation({
  args: {
    reportId: v.id("barReports"),
    resolvedBy: v.string(),
    resolvedNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reportId, {
      status: "rejected",
      resolvedAt: Date.now(),
      resolvedBy: args.resolvedBy,
      resolvedNote: args.resolvedNote,
    });
  },
});
