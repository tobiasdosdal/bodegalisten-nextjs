import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { verifyClerkToken, extractBearerToken } from "./auth";

const http = httpRouter();

// ============================================================================
// Response Helpers
// ============================================================================

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ data }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

function errorResponse(
  message: string,
  code: string,
  status: number
): Response {
  return new Response(JSON.stringify({ error: message, code }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function corsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// Parse JSON body safely
async function parseBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

// Auth middleware
async function requireAuth(
  request: Request
): Promise<{ userId: string } | Response> {
  const token = extractBearerToken(request);
  if (!token) {
    return errorResponse("Missing authorization token", "UNAUTHORIZED", 401);
  }

  // Get Clerk issuer from environment
  const issuer = process.env.CLERK_ISSUER_URL;
  if (!issuer) {
    return errorResponse("Server configuration error", "SERVER_ERROR", 500);
  }

  const auth = await verifyClerkToken(token, issuer);
  if (!auth) {
    return errorResponse("Invalid or expired token", "UNAUTHORIZED", 401);
  }

  return { userId: auth.userId };
}

// Parse URL path into segments
function getPathSegments(request: Request): string[] {
  const url = new URL(request.url);
  return url.pathname.split("/").filter(Boolean);
}

// ============================================================================
// CORS Preflight Handler
// ============================================================================

http.route({
  path: "/*",
  method: "OPTIONS",
  handler: httpAction(async () => corsResponse()),
});

// ============================================================================
// Public Endpoints - Bars (exact paths)
// ============================================================================

// GET /bars - List all active bars
http.route({
  path: "/bars",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const bars = await ctx.runQuery(api.bars.list);
    return jsonResponse(bars);
  }),
});

// GET /bars/search?q=query - Search bars
http.route({
  path: "/bars/search",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const bars = await ctx.runQuery(api.bars.search, { query });
    return jsonResponse(bars);
  }),
});

// ============================================================================
// Bar Detail Routes (using pathPrefix for dynamic :id)
// ============================================================================

// GET /bar/:id, /bar/:id/reviews, /bar/:id/stats, /bar/:id/photos, /bar/:id/checkins
http.route({
  pathPrefix: "/bar/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const segments = getPathSegments(request);
    const url = new URL(request.url);

    // /bar/:id
    if (segments.length === 2) {
      const id = segments[1];
      const bar = await ctx.runQuery(api.bars.getById, { id: id as Id<"bars"> });
      if (!bar) {
        return errorResponse("Bar not found", "NOT_FOUND", 404);
      }
      return jsonResponse(bar);
    }

    // /bar/:id/:action
    if (segments.length === 3) {
      const barId = segments[1] as Id<"bars">;
      const action = segments[2];

      switch (action) {
        case "reviews": {
          const reviews = await ctx.runQuery(api.reviews.getByBar, { barId });
          return jsonResponse(reviews);
        }
        case "stats": {
          const stats = await ctx.runQuery(api.reviews.getStats, { barId });
          return jsonResponse(stats);
        }
        case "photos": {
          const limit = parseInt(url.searchParams.get("limit") || "20");
          const photos = await ctx.runQuery(api.photos.getByBar, { barId, limit });
          return jsonResponse(photos);
        }
        case "checkins": {
          const checkIns = await ctx.runQuery(api.checkIns.getActiveByBar, { barId });
          return jsonResponse(checkIns);
        }
        case "favorited": {
          const auth = await requireAuth(request);
          if (auth instanceof Response) return auth;
          const isFavorite = await ctx.runQuery(api.favorites.isFavorite, {
            userId: auth.userId,
            barId,
          });
          return jsonResponse({ isFavorite });
        }
      }
    }

    return errorResponse("Not found", "NOT_FOUND", 404);
  }),
});

// POST /bar/:id/reviews - Create review
http.route({
  pathPrefix: "/bar/",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const segments = getPathSegments(request);

    // /bar/:id/reviews
    if (segments.length === 3 && segments[2] === "reviews") {
      const barId = segments[1] as Id<"bars">;
      const body = await parseBody<{
        rating: number;
        comment?: string;
        smoking?: number;
        priceLevel?: string;
        userName?: string;
      }>(request);

      if (!body || typeof body.rating !== "number") {
        return errorResponse("Rating required", "BAD_REQUEST", 400);
      }

      const reviewId = await ctx.runMutation(api.reviews.create, {
        barId,
        rating: body.rating,
        comment: body.comment,
        smoking: body.smoking,
        priceLevel: body.priceLevel,
        userId: auth.userId,
        userName: body.userName,
      });

      return jsonResponse({ id: reviewId }, 201);
    }

    return errorResponse("Not found", "NOT_FOUND", 404);
  }),
});

// ============================================================================
// User Routes (pathPrefix for /users/:id/...)
// ============================================================================

// GET /users/:id/profile, /users/:id/following
http.route({
  pathPrefix: "/users/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const segments = getPathSegments(request);

    // /users/:id/profile
    if (segments.length === 3 && segments[2] === "profile") {
      const clerkId = segments[1];
      const profile = await ctx.runQuery(api.profiles.getPublicProfile, { clerkId });
      if (!profile) {
        return errorResponse("Profile not found", "NOT_FOUND", 404);
      }
      return jsonResponse(profile);
    }

    // /users/:id/following - Check if I'm following this user (auth required)
    if (segments.length === 3 && segments[2] === "following") {
      const auth = await requireAuth(request);
      if (auth instanceof Response) return auth;
      const targetUserId = segments[1];
      const isFollowing = await ctx.runQuery(api.follows.isFollowing, {
        followerId: auth.userId,
        followingId: targetUserId,
      });
      return jsonResponse({ isFollowing });
    }

    return errorResponse("Not found", "NOT_FOUND", 404);
  }),
});

// POST /users/:id/follow
http.route({
  pathPrefix: "/users/",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const segments = getPathSegments(request);

    // /users/:id/follow
    if (segments.length === 3 && segments[2] === "follow") {
      const targetUserId = segments[1];
      await ctx.runMutation(api.follows.follow, {
        targetUserId,
        currentUserId: auth.userId,
      });
      return jsonResponse({ success: true }, 201);
    }

    return errorResponse("Not found", "NOT_FOUND", 404);
  }),
});

// DELETE /users/:id/follow
http.route({
  pathPrefix: "/users/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const segments = getPathSegments(request);

    // /users/:id/follow
    if (segments.length === 3 && segments[2] === "follow") {
      const targetUserId = segments[1];
      await ctx.runMutation(api.follows.unfollow, {
        targetUserId,
        currentUserId: auth.userId,
      });
      return jsonResponse({ success: true });
    }

    return errorResponse("Not found", "NOT_FOUND", 404);
  }),
});

// ============================================================================
// Feed Routes
// ============================================================================

// GET /feed/public - Public activity feed
http.route({
  path: "/feed/public",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const feed = await ctx.runQuery(api.feed.getPublicFeed, { limit });
    return jsonResponse(feed);
  }),
});

// GET /feed - Personal activity feed (auth required)
http.route({
  path: "/feed",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const feed = await ctx.runQuery(api.feed.getPersonalFeed, {
      userId: auth.userId,
      limit,
    });
    return jsonResponse(feed);
  }),
});

// GET /feed/friends - Friends' active check-ins (auth required)
http.route({
  path: "/feed/friends",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const checkIns = await ctx.runQuery(api.checkIns.getFriendsActive, {
      userId: auth.userId,
    });
    return jsonResponse(checkIns);
  }),
});

// ============================================================================
// Profile Routes (/me)
// ============================================================================

// GET /me - Current user profile
http.route({
  path: "/me",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const profile = await ctx.runQuery(api.profiles.getByClerkId, {
      clerkId: auth.userId,
    });
    return jsonResponse(profile);
  }),
});

// PUT /me - Update profile
http.route({
  path: "/me",
  method: "PUT",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = await parseBody<{
      displayName: string;
      bio?: string;
      avatarUrl?: string;
      favoriteBarId?: string;
      isPublic?: boolean;
    }>(request);

    if (!body || !body.displayName) {
      return errorResponse("Display name is required", "BAD_REQUEST", 400);
    }

    await ctx.runMutation(api.profiles.createOrUpdate, {
      clerkId: auth.userId,
      displayName: body.displayName,
      bio: body.bio,
      avatarUrl: body.avatarUrl,
      favoriteBarId: body.favoriteBarId as Id<"bars"> | undefined,
      isPublic: body.isPublic,
    });

    return jsonResponse({ success: true });
  }),
});

// GET /me/stats
http.route({
  path: "/me/stats",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const stats = await ctx.runQuery(api.profiles.getProfileStats, {
      clerkId: auth.userId,
    });
    return jsonResponse(stats);
  }),
});

// GET /me/checkin - Current active check-in
http.route({
  path: "/me/checkin",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const checkIn = await ctx.runQuery(api.checkIns.getActiveByUser, {
      userId: auth.userId,
    });
    return jsonResponse(checkIn);
  }),
});

// POST /me/checkin - Create check-in
http.route({
  path: "/me/checkin",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = await parseBody<{
      barId: string;
      message?: string;
      visibility?: string;
    }>(request);

    if (!body || !body.barId) {
      return errorResponse("Bar ID required", "BAD_REQUEST", 400);
    }

    const checkInId = await ctx.runMutation(api.checkIns.create, {
      userId: auth.userId,
      barId: body.barId as Id<"bars">,
      message: body.message,
      visibility: body.visibility,
    });

    return jsonResponse({ id: checkInId }, 201);
  }),
});

// DELETE /me/checkin/:id - handled via pathPrefix
http.route({
  pathPrefix: "/me/checkin/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const segments = getPathSegments(request);
    if (segments.length === 3) {
      const checkInId = segments[2] as Id<"checkIns">;
      await ctx.runMutation(api.checkIns.remove, { checkInId });
      return jsonResponse({ success: true });
    }

    return errorResponse("Check-in ID required", "BAD_REQUEST", 400);
  }),
});

// GET /me/checkins - Check-in history
http.route({
  path: "/me/checkins",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const history = await ctx.runQuery(api.checkIns.getUserHistory, {
      userId: auth.userId,
      limit,
    });
    return jsonResponse(history);
  }),
});

// GET /me/favorites
http.route({
  path: "/me/favorites",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const favorites = await ctx.runQuery(api.favorites.getByUser, {
      userId: auth.userId,
    });
    return jsonResponse(favorites);
  }),
});

// POST /me/favorites/:barId
http.route({
  pathPrefix: "/me/favorites/",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const segments = getPathSegments(request);
    if (segments.length === 3) {
      const barId = segments[2] as Id<"bars">;
      const favoriteId = await ctx.runMutation(api.favorites.add, {
        userId: auth.userId,
        barId,
      });
      return jsonResponse({ id: favoriteId }, 201);
    }

    return errorResponse("Bar ID required", "BAD_REQUEST", 400);
  }),
});

// DELETE /me/favorites/:barId
http.route({
  pathPrefix: "/me/favorites/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const segments = getPathSegments(request);
    if (segments.length === 3) {
      const barId = segments[2] as Id<"bars">;
      await ctx.runMutation(api.favorites.remove, {
        userId: auth.userId,
        barId,
      });
      return jsonResponse({ success: true });
    }

    return errorResponse("Bar ID required", "BAD_REQUEST", 400);
  }),
});

// GET /me/following
http.route({
  path: "/me/following",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const following = await ctx.runQuery(api.follows.getFollowing, {
      userId: auth.userId,
    });
    return jsonResponse(following);
  }),
});

// GET /me/followers
http.route({
  path: "/me/followers",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const followers = await ctx.runQuery(api.follows.getFollowers, {
      userId: auth.userId,
    });
    return jsonResponse(followers);
  }),
});

// GET /me/photos
http.route({
  path: "/me/photos",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const photos = await ctx.runQuery(api.photos.getByUser, {
      userId: auth.userId,
      limit,
    });
    return jsonResponse(photos);
  }),
});

// ============================================================================
// Photo Routes
// ============================================================================

// POST /photos/upload-url
http.route({
  path: "/photos/upload-url",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const uploadUrl = await ctx.runMutation(api.photos.generateUploadUrl, {});
    return jsonResponse({ uploadUrl });
  }),
});

// POST /photos - Save photo record
http.route({
  path: "/photos",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = await parseBody<{
      barId: string;
      storageId: string;
      caption?: string;
    }>(request);

    if (!body || !body.barId || !body.storageId) {
      return errorResponse("Bar ID and storage ID required", "BAD_REQUEST", 400);
    }

    const photoId = await ctx.runMutation(api.photos.upload, {
      userId: auth.userId,
      barId: body.barId as Id<"bars">,
      storageId: body.storageId as Id<"_storage">,
      caption: body.caption,
    });

    return jsonResponse({ id: photoId }, 201);
  }),
});

// DELETE /photos/:id
http.route({
  pathPrefix: "/photos/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const segments = getPathSegments(request);
    if (segments.length === 2 && segments[1] !== "upload-url") {
      const photoId = segments[1] as Id<"photos">;
      await ctx.runMutation(api.photos.remove, {
        photoId,
        userId: auth.userId,
      });
      return jsonResponse({ success: true });
    }

    return errorResponse("Photo ID required", "BAD_REQUEST", 400);
  }),
});

// ============================================================================
// Review Routes
// ============================================================================

// DELETE /reviews/:id
http.route({
  pathPrefix: "/reviews/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const segments = getPathSegments(request);
    if (segments.length === 2) {
      const reviewId = segments[1] as Id<"reviews">;
      await ctx.runMutation(api.reviews.remove, { id: reviewId });
      return jsonResponse({ success: true });
    }

    return errorResponse("Review ID required", "BAD_REQUEST", 400);
  }),
});

export default http;
