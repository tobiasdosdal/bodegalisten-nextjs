# Bodegalisten React Native Expo App - Implementation Plan

## Overview
Create a new React Native Expo app with **full feature parity** with the existing Next.js web app.
- **Platform:** iOS only (initially)
- **Project:** Separate Expo repo (not monorepo)
- **Offline:** Online-only (no caching)

---

## Project Setup

```bash
# Create new Expo project
npx create-expo-app bodegalisten-expo -t expo-template-blank-typescript
cd bodegalisten-expo

# Install dependencies
npx expo install expo-router expo-location react-native-maps \
  react-native-gesture-handler react-native-reanimated \
  @gorhom/bottom-sheet react-native-svg expo-secure-store \
  expo-image-picker @react-native-async-storage/async-storage

npm install @clerk/clerk-expo @tanstack/react-query lucide-react-native date-fns
```

---

## Project Structure

```
bodegalisten-expo/
├── app/                          # Expo Router file-based routing
│   ├── (tabs)/                   # Tab navigation
│   │   ├── _layout.tsx           # Tab config
│   │   ├── index.tsx             # Map screen
│   │   ├── list.tsx              # Bar list
│   │   ├── feed.tsx              # Activity feed
│   │   └── profile.tsx           # User profile
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── bar/[id].tsx              # Bar detail
│   ├── user/[clerkId].tsx        # User profile
│   ├── friends/index.tsx
│   ├── notifications/index.tsx
│   ├── settings/index.tsx
│   └── _layout.tsx               # Root layout with providers
├── components/
│   ├── ui/                       # Button, Card, Input, Modal, Avatar
│   ├── map/                      # MapView, BarMarker
│   ├── bar/                      # BarCard, ReviewCard, StarRating
│   ├── social/                   # FavoriteButton, FollowButton, FriendCard
│   ├── checkin/                  # CheckInButton, CheckInModal
│   └── feed/                     # ActivityItem, ActivityFeed
├── hooks/
│   ├── useGeolocation.ts
│   ├── useSettings.ts
│   └── api/                      # useBars, useReviews, useFavorites, etc.
├── lib/
│   ├── api-client.ts             # REST client with Clerk auth
│   └── utils.ts
├── types/index.ts
└── constants/
    ├── colors.ts
    └── api.ts
```

---

## Key Dependencies

```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "@clerk/clerk-expo": "^2.0.0",
  "react-native-maps": "1.18.0",
  "@tanstack/react-query": "^5.28.0",
  "@gorhom/bottom-sheet": "^5.0.0",
  "lucide-react-native": "^0.300.0",
  "expo-location": "~18.0.0",
  "expo-image-picker": "~16.0.0"
}
```

---

## API Integration

Integrate with existing Convex HTTP REST API:

```typescript
// lib/api-client.ts
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_HTTP_URL;

class ApiClient {
  private async getHeaders() {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = await getToken(); // Clerk
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${CONVEX_URL}${endpoint}`, {
      headers: await this.getHeaders(),
    });
    return res.json();
  }
  // post, put, delete...
}
```

### Endpoints to use (from convex/http.ts):
- `GET /bars` - List bars
- `GET /bar/:id` - Bar details
- `GET /bar/:id/reviews` - Reviews
- `POST /bar/:id/reviews` - Create review
- `GET/POST /me/checkin` - Check-ins
- `GET/POST/DELETE /me/favorites` - Favorites
- `GET /me/following` / `GET /me/followers` - Social
- `GET /feed` - Activity feed
- `GET /notifications` - Notifications

---

## Implementation Phases

### Phase 1: Foundation
1. Initialize Expo project with TypeScript + Expo Router
2. Configure Clerk authentication
3. Set up TanStack Query
4. Create API client with auth
5. Build base UI components (Button, Card, Input, Avatar)
6. Implement Map screen with react-native-maps
7. Add bar markers
8. Build Bar list screen
9. Set up tab navigation

### Phase 2: Bar Details
1. Bar detail screen/bottom sheet
2. Display hours, address, phone, website
3. Distance calculation
4. Apple Maps navigation link
5. Reviews list + StarRating component
6. Review form (auth required)
7. Photo gallery

### Phase 3: Social Features
1. User profile screen
2. Edit profile
3. Favorites (heart button, list)
4. Follow/unfollow system
5. Friends page (following/followers/mutual)
6. User search
7. Online status indicator

### Phase 4: Check-ins & Feed
1. Check-in button + modal
2. Visibility options (public/friends/private)
3. Bar check-ins list ("who's here")
4. Friends at bar component
5. Activity feed screen
6. Personal feed vs public feed tabs

### Phase 5: Notifications & Polish
1. Notifications screen
2. Mark as read
3. Notification badge on tab
4. Settings screen (distance, transport type)
5. Error states, loading states, empty states
6. Pull-to-refresh
7. App icons, splash screen
8. EAS Build config for App Store

---

## Environment Setup

```bash
# .env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
EXPO_PUBLIC_CONVEX_HTTP_URL=https://xxx.convex.cloud
```

```json
// app.json iOS config
{
  "ios": {
    "bundleIdentifier": "dk.bodegalisten.app",
    "infoPlist": {
      "NSLocationWhenInUseUsageDescription": "Find nearby bars",
      "NSCameraUsageDescription": "Take bar photos",
      "NSPhotoLibraryUsageDescription": "Upload photos"
    }
  }
}
```

---

## Navigation Structure

```
RootNavigator (Stack)
├── (tabs) - TabNavigator
│   ├── index (Map)        - Icon: Map
│   ├── list (Bar List)    - Icon: List
│   ├── feed (Activity)    - Icon: Rss
│   └── profile (Profile)  - Icon: User
├── bar/[id]               - Bar detail (modal/push)
├── user/[clerkId]         - Other user profile
├── friends                - Friends list
├── notifications          - Notifications
├── settings               - App settings
├── profile/edit           - Edit profile (modal)
└── (auth)                 - Auth screens
    ├── sign-in
    └── sign-up
```

---

## Screens & Components

### Tab Screens
| Screen | Route | Description |
|--------|-------|-------------|
| Map | `/(tabs)/` | Interactive map with bar markers |
| Bar List | `/(tabs)/list` | Scrollable list sorted by distance |
| Activity Feed | `/(tabs)/feed` | Personal + public activity |
| Profile | `/(tabs)/profile` | Current user profile |

### Detail Screens
| Screen | Route | Description |
|--------|-------|-------------|
| Bar Detail | `/bar/[id]` | Full bar info, reviews, photos |
| User Profile | `/user/[clerkId]` | Other user's public profile |
| Friends | `/friends` | Following/followers tabs |
| Notifications | `/notifications` | In-app notifications |
| Settings | `/settings` | Distance, transport preferences |

### Key Components
- `BarCard` - List item with name, distance, rating
- `BarMarker` - Custom map marker
- `StarRating` - 1-5 star rating display/input
- `FavoriteButton` - Heart toggle
- `FollowButton` - Follow/unfollow
- `CheckInButton` - Check in to bar
- `ActivityItem` - Feed item (review, check-in, etc.)
- `NotificationItem` - Notification row

---

## TypeScript Types

```typescript
interface Bar {
  _id: string;
  name: string;
  lat: number;
  lon: number;
  street?: string;
  city?: string;
  phone?: string;
  website?: string;
  hours?: string;
  description?: string;
  category?: string;
}

interface Review {
  _id: string;
  barId: string;
  rating: number;
  comment?: string;
  smoking?: number;
  priceLevel?: string;
  userId?: string;
  userName?: string;
  createdAt: number;
}

interface UserProfile {
  _id: string;
  clerkId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  isPublic: boolean;
  lastActiveAt?: number;
}

interface CheckIn {
  _id: string;
  userId: string;
  barId: string;
  message?: string;
  visibility: 'public' | 'friends' | 'private';
  expiresAt: number;
  createdAt: number;
}

interface Activity {
  _id: string;
  userId: string;
  type: 'checkin' | 'review' | 'photo' | 'favorite';
  barId: string;
  createdAt: number;
  user?: UserProfile;
  bar?: Bar;
}

interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
}
```

---

## Reference Files (existing backend)

These files in the Next.js app define the API and patterns to follow:

- `convex/http.ts` - All REST API endpoints
- `convex/schema.ts` - Database schema
- `convex/auth.ts` - JWT verification
- `components/views/BarDetailPanel.tsx` - Bar detail UI patterns
- `components/social/` - Social component patterns
- `hooks/useMap.ts` - TanStack Query patterns
