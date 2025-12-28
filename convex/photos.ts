import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get photos for a specific bar
export const getByBar = query({
  args: {
    barId: v.id("bars"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const photos = await ctx.db
      .query("photos")
      .withIndex("by_bar", (q) => q.eq("barId", args.barId))
      .order("desc")
      .take(limit);

    // Hydrate with user profiles and generate URLs
    return Promise.all(
      photos.map(async (photo) => {
        const [profile, url] = await Promise.all([
          ctx.db
            .query("userProfiles")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", photo.userId))
            .first(),
          ctx.storage.getUrl(photo.storageId),
        ]);

        return {
          ...photo,
          url,
          user: profile
            ? {
                clerkId: profile.clerkId,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
              }
            : {
                clerkId: photo.userId,
                displayName: "Anonym",
                avatarUrl: null,
              },
        };
      })
    );
  },
});

// Get photos by a specific user
export const getByUser = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const photos = await ctx.db
      .query("photos")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    // Hydrate with bar details and generate URLs
    return Promise.all(
      photos.map(async (photo) => {
        const [bar, url] = await Promise.all([
          ctx.db.get(photo.barId),
          ctx.storage.getUrl(photo.storageId),
        ]);

        return {
          ...photo,
          url,
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

// Get a single photo with full details
export const getById = query({
  args: { photoId: v.id("photos") },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.photoId);
    if (!photo) return null;

    const [profile, bar, url] = await Promise.all([
      ctx.db
        .query("userProfiles")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", photo.userId))
        .first(),
      ctx.db.get(photo.barId),
      ctx.storage.getUrl(photo.storageId),
    ]);

    return {
      ...photo,
      url,
      user: profile
        ? {
            clerkId: profile.clerkId,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
          }
        : {
            clerkId: photo.userId,
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
  },
});

// Generate upload URL for client-side upload
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save photo after upload
export const upload = mutation({
  args: {
    userId: v.string(),
    barId: v.id("bars"),
    storageId: v.id("_storage"),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const photoId = await ctx.db.insert("photos", {
      userId: args.userId,
      barId: args.barId,
      storageId: args.storageId,
      caption: args.caption,
      createdAt: now,
    });

    // Record activity
    await ctx.db.insert("activities", {
      userId: args.userId,
      type: "photo",
      barId: args.barId,
      referenceId: photoId,
      createdAt: now,
    });

    return photoId;
  },
});

// Delete a photo
export const remove = mutation({
  args: {
    photoId: v.id("photos"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.photoId);

    if (!photo) {
      throw new Error("Photo not found");
    }

    // Only allow owner to delete
    if (photo.userId !== args.userId) {
      throw new Error("Not authorized to delete this photo");
    }

    // Delete from storage
    await ctx.storage.delete(photo.storageId);

    // Delete photo record
    await ctx.db.delete(args.photoId);

    // Remove activity
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const activity = activities.find(
      (a) => a.type === "photo" && a.referenceId === String(args.photoId)
    );

    if (activity) {
      await ctx.db.delete(activity._id);
    }
  },
});

// Get photo count for a bar
export const getCountByBar = query({
  args: { barId: v.id("bars") },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_bar", (q) => q.eq("barId", args.barId))
      .collect();

    return photos.length;
  },
});
