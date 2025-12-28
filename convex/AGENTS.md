# CONVEX BACKEND

Primary backend for all new features. Real-time by default.

## TABLES (schema.ts)

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `bars` | Bar/bodega locations | `by_city` |
| `reviews` | User reviews with ratings | `by_bar` |
| `userProfiles` | Clerk-linked profiles | `by_clerk_id` |
| `checkIns` | Temporary presence (expires) | `by_bar`, `by_expires` |
| `follows` | Social graph | `by_follower`, `by_following` |
| `photos` | Bar photos with storage | `by_bar`, `by_user` |
| `favorites` | Saved bars | `by_both` (userId+barId) |
| `activities` | Feed events | `by_user_recent` |

## FILE → FUNCTION MAP

| File | Queries | Mutations |
|------|---------|-----------|
| `bars.ts` | `list`, `get` | - |
| `reviews.ts` | `getByBar` | `create` |
| `favorites.ts` | `getByUser`, `isFavorite` | `toggle` |
| `follows.ts` | `getFollowers`, `getFollowing`, `isFollowing` | `toggle` |
| `checkIns.ts` | `getActive`, `getByBar` | `create` |
| `photos.ts` | `getByBar` | `generateUploadUrl`, `create` |
| `profiles.ts` | `get`, `getByClerkId` | `upsert` |
| `feed.ts` | `getForUser`, `getGlobal` | - |
| `crons.ts` | - | Cleanup expired check-ins |
| `auth.ts` | Clerk webhook handlers | - |

## PATTERNS

```typescript
// Query with auth
export const myQuery = query({
  args: { barId: v.id("bars") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    // identity?.subject = Clerk userId
  },
});

// Mutation that logs activity
export const create = mutation({
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("reviews", { ...args });
    await ctx.db.insert("activities", {
      userId, type: "review", barId, referenceId: id,
      createdAt: Date.now(),
    });
    return id;
  },
});
```

## CONVENTIONS

- **Auth**: `ctx.auth.getUserIdentity()` returns Clerk identity
- **IDs**: Use `v.id("tableName")` for foreign keys
- **Timestamps**: `Date.now()` (milliseconds)
- **Storage**: `ctx.storage` for file uploads (photos)

## ANTI-PATTERNS

- **Don't** import from `lib/db.ts` (SQLite is legacy)
- **Don't** use TanStack Query for Convex data
- **Don't** create REST endpoints (use http.ts only for webhooks)

## COMMANDS

```bash
npx convex dev          # Dev server with hot reload
npx convex deploy       # Deploy to production
npx convex dashboard    # Open web dashboard
```
