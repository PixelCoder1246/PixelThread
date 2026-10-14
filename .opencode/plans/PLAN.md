# PixelThread Frontend Implementation Plan

## Overview
Build a complete, responsive, and functional frontend for the PixelThread AI-powered blogging platform using Next.js 16, React 19, and TypeScript. The frontend will consume the existing comprehensive backend API (108 endpoints across 17 modules).

---

## Tech Stack & Architecture

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| UI | React 19, CSS Modules |
| State | React Query (TanStack Query) + React Context |
| Auth | Cookie-based (HttpOnly), handled by backend |
| API Client | Custom fetch wrapper with credentials: 'include' |
| Forms | React Hook Form + Zod validation |
| Editor | TipTap (rich text editor with AI integration) |
| Icons | Lucide React |
| Date | date-fns |

---

## Directory Structure (to create)

```
client/src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (main)/            # Main app route group (protected)
│   │   ├── layout.tsx     # Main layout with sidebar/header
│   │   ├── page.tsx       # Home feed
│   │   ├── posts/
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── edit/
│   │   │   ├── new/
│   │   │   └── my-posts/
│   │   ├── profile/
│   │   │   ├── [id]/
│   │   │   └── settings/
│   │   ├── search/
│   │   ├── bookmarks/
│   │   ├── history/
│   │   ├── notifications/
│   │   ├── following/
│   │   └── analytics/
│   ├── (admin)/           # Admin route group
│   │   ├── layout.tsx
│   │   └── dashboard/
│   ├── tags/
│   │   └── [name]/
│   ├── api/               # API route proxies (if needed)
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── Toast.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Tabs.tsx
│   │   ├── Pagination.tsx
│   │   ├── Skeleton.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── MainLayout.tsx
│   │   └── AuthLayout.tsx
│   ├── post/
│   │   ├── PostCard.tsx
│   │   ├── PostList.tsx
│   │   ├── PostContent.tsx
│   │   ├── PostHeader.tsx
│   │   ├── PostActions.tsx
│   │   ├── PostEditor.tsx
│   │   ├── PostSEO.tsx
│   │   └── PostTags.tsx
│   ├── comment/
│   │   ├── CommentThread.tsx
│   │   ├── CommentItem.tsx
│   │   ├── CommentForm.tsx
│   │   └── ReplyForm.tsx
│   ├── user/
│   │   ├── UserCard.tsx
│   │   ├── UserAvatar.tsx
│   │   ├── UserProfile.tsx
│   │   ├── FollowButton.tsx
│   │   └── UserSettings.tsx
│   ├── editor/
│   │   ├── Editor.tsx
│   │   ├── Toolbar.tsx
│   │   ├── AIPanel.tsx
│   │   ├── ImageUpload.tsx
│   │   └── BlockComponents.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   ├── SearchFilters.tsx
│   │   └── SearchSuggestions.tsx
│   ├── notifications/
│   │   ├── NotificationBell.tsx
│   │   ├── NotificationList.tsx
│   └── NotificationItem.tsx
│   ├── analytics/
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── AnalyticsCard.tsx
│   │   └── Charts.tsx
│   └── forms/
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       ├── PostForm.tsx
│       ├── ProfileForm.tsx
│       └── SettingsForm.tsx
├── features/              # Feature-scoped modules
│   ├── auth/
│   │   ├── authService.ts
│   │   ├── useAuth.ts
│   │   ├── AuthProvider.tsx
│   │   └── types.ts
│   ├── posts/
│   │   ├── postService.ts
│   │   ├── usePosts.ts
│   │   ├── usePost.ts
│   │   └── types.ts
│   ├── comments/
│   │   ├── commentService.ts
│   │   ├── useComments.ts
│   │   └── types.ts
│   ├── likes/
│   │   ├── likeService.ts
│   │   └── useLike.ts
│   ├── follow/
│   │   ├── followService.ts
│   │   └── useFollow.ts
│   ├── bookmarks/
│   │   ├── bookmarkService.ts
│   │   └── useBookmark.ts
│   ├── notifications/
│   │   ├── notificationService.ts
│   │   └── useNotifications.ts
│   ├── search/
│   │   ├── searchService.ts
│   │   └── useSearch.ts
│   ├── ai/
│   │   ├── aiService.ts
│   │   └── useAI.ts
│   ├── tags/
│   │   ├── tagService.ts
│   │   └── useTags.ts
│   ├── users/
│   │   ├── userService.ts
│   │   └── useUser.ts
│   ├── history/
│   │   ├── historyService.ts
│   │   └── useHistory.ts
│   ├── media/
│   │   ├── mediaService.ts
│   │   └── useMedia.ts
│   └── analytics/
│       ├── analyticsService.ts
│       └── useAnalytics.ts
├── hooks/
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   ├── useClickOutside.ts
│   └── useIntersectionObserver.ts
├── lib/
│   ├── api.ts             # API client with fetch wrapper
│   ├── queryClient.ts     # React Query config
│   ├── utils.ts           # Utility functions
│   ├── constants.ts       # App constants
│   ├── validations.ts     # Zod schemas
│   └── date.ts            # Date formatting
├── services/              # (Alternative to features/*/service.ts)
├── types/
│   ├── api.ts             # API response types
│   ├── post.ts
│   ├── user.ts
│   ├── comment.ts
│   ├── notification.ts
│   └── index.ts
├── constants/
│   ├── routes.ts
│   ├── ai.ts
│   └── enums.ts
├── utils/
│   ├── slugify.ts
│   ├── format.ts
│   └── storage.ts
└── providers/
    ├── QueryProvider.tsx
    ├── AuthProvider.tsx
    └── ToastProvider.tsx
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Set up core infrastructure, authentication, and basic layout

#### 1.1 Project Setup & Configuration
- [ ] Install dependencies: `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react`, `date-fns`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item`, `clsx`, `tailwind-merge` (if using Tailwind) or CSS Modules setup
- [ ] Configure React Query provider with default options
- [ ] Create API client (`lib/api.ts`) with:
  - Base URL from env
  - Credentials: 'include' for cookies
  - Error handling with ApiError class
  - Request/response interceptors for auth
- [ ] Create TypeScript types for all API responses (`types/api.ts`, `types/post.ts`, etc.)
- [ ] Set up Zod validation schemas (`lib/validations.ts`)
- [ ] Create utility functions (`lib/utils.ts`, `lib/constants.ts`)

#### 1.2 Authentication System
- [ ] Create `AuthContext` with user state, login, logout, register, refresh
- [ ] Implement `useAuth` hook
- [ ] Build auth service (`features/auth/authService.ts`) with all auth endpoints
- [ ] Create auth forms: `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`
- [ ] Build auth pages: `/login`, `/register`, `/forgot-password`, `/reset-password`
- [ ] Create `AuthLayout` component
- [ ] Implement protected route wrapper (redirect if not authenticated)
- [ ] Implement verified-only route wrapper (redirect if email not verified)

#### 1.3 Core Layout & Navigation
- [ ] Build `Header` component with:
  - Logo/brand
  - Search bar (global)
  - Notification bell
  - User avatar dropdown (profile, settings, logout)
  - Mobile menu toggle
- [ ] Build `Sidebar` component with navigation links
- [ ] Build `MainLayout` with responsive sidebar (collapsible on mobile)
- [ ] Build `AuthLayout` for auth pages
- [ ] Create root layout with providers (QueryProvider, AuthProvider, ToastProvider)
- [ ] Add global styles (`globals.css`) with CSS variables for theming

#### 1.4 UI Component Library (Base Components)
- [ ] Button (variants: primary, secondary, outline, ghost, danger; sizes: sm, md, lg)
- [ ] Input, Textarea, Select, Checkbox, Radio
- [ ] Card, CardHeader, CardContent, CardFooter
- [ ] Modal (with portal, focus trap, escape to close)
- [ ] Dropdown (with click outside to close)
- [ ] Avatar (with fallback initials, sizes)
- [ ] Badge (variants: default, success, warning, danger, info)
- [ ] Spinner / Loading skeletons
- [ ] Toast notification system
- [ ] Tooltip
- [ ] Tabs
- [ ] Pagination
- [ ] Skeleton loaders for posts, comments, users

---

### Phase 2: Post Feed & Reading Experience (Week 2)
**Goal**: Public post feed, single post view, search, tags

#### 2.1 Post Feed (Home Page)
- [ ] Create `PostCard` component with:
  - Title, excerpt, author, date, tags, read time
  - Like button (with count, optimistic update)
  - Bookmark button
  - Thumbnail image (if available)
- [ ] Create `PostList` with infinite scroll / pagination
- [ ] Build home page (`/`) with:
  - Hero section
  - Post feed (paginated)
  - Sidebar with trending tags, popular authors
- [ ] Implement `usePosts` hook with React Query
- [ ] Add loading skeletons and error states

#### 2.2 Single Post Page (`/posts/[slug]`)
- [ ] Create `PostContent` component to render TipTap JSON content
- [ ] Build `PostHeader` with title, author, date, tags, reading time, actions
- [ ] Build `PostActions` with like, bookmark, share, report
- [ ] Implement SEO meta tags from API response
- [ ] Record view on mount (`POST /api/posts/:id/view`)
- [ ] Add comment section (see Phase 3)
- [ ] Add related posts sidebar
- [ ] Handle private/draft posts (show 404 for non-authors)

#### 2.3 Search & Discovery
- [ ] Build `SearchBar` component (global header + dedicated page)
- [ ] Create search results page (`/search`) with:
  - Query input with suggestions
  - Filter by tags, author, sort options
  - Results with pagination
- [ ] Implement `useSearch` hook with debounced queries
- [ ] Build tag page (`/tags/[name]`) with tag posts
- [ ] Build popular tags cloud component
- [ ] Build discover authors component

#### 2.4 Post Editor (Create/Edit)
- [ ] Set up TipTap editor with extensions:
  - StarterKit (headings, bold, italic, lists, code, blockquote, etc.)
  - Image upload (drag-drop, paste, click to upload)
  - Link, Placeholder, TaskList, TaskItem
- [ ] Create custom block components for rendering
- [ ] Build `PostEditor` component with:
  - Title input
  - Rich text editor
  - Excerpt field
  - Status selector (Draft/Published)
  - Visibility selector (Public/Private)
  - Tag input (with autocomplete from existing tags)
  - Cover image upload
  - AI assistant panel (sidebar)
- [ ] Create `/posts/new` page (requires auth + verified)
- [ ] Create `/posts/[slug]/edit` page (owner/admin only)
- [ ] Implement auto-save draft to localStorage
- [ ] Handle image uploads via `/api/media` endpoints

---

### Phase 3: Social Features (Week 3)
**Goal**: Comments, likes, follows, bookmarks, notifications

#### 3.1 Comments System
- [ ] Build `CommentThread` component (recursive tree rendering)
- [ ] Build `CommentItem` with:
  - Author avatar, name, date
  - Content
  - Like button with count
  - Reply button
  - Edit/Delete (owner/admin)
- [ ] Build `CommentForm` for root comments
- [ ] Build `ReplyForm` for nested replies
- [ ] Implement `useComments` hook with:
  - Fetch threaded comments
  - Create comment/reply (optimistic)
  - Update comment
  - Delete comment (cascading)
- [ ] Add comment count to post header
- [ ] Real-time feel with optimistic updates

#### 3.2 Likes System
- [ ] Create `useLike` hook for posts and comments
- [ ] Optimistic UI updates for like buttons
- [ ] Show like count and user's like status
- [ ] Like list modal (who liked)

#### 3.3 Follow System
- [ ] Build `FollowButton` component
- [ ] Create `useFollow` hook
- [ ] Build followers/following pages (`/profile/[id]/followers`, `/profile/[id]/following`)
- [ ] Add follow suggestions in sidebar

#### 3.4 Bookmarks
- [ ] Build bookmark button in PostCard/PostHeader
- [ ] Create bookmarks page (`/bookmarks`) with grid/list view
- [ ] Implement `useBookmark` hook

#### 3.5 Notifications
- [ ] Build `NotificationBell` in header with unread count
- [ ] Create notification dropdown/list page (`/notifications`)
- [ ] Build `NotificationItem` with:
  - Type icon (like, comment, follow, system)
  - Message
  - Timestamp
  - Link to relevant content
  - Mark as read action
- [ ] Implement `useNotifications` hook with:
  - Fetch notifications (paginated)
  - Mark read / mark all read
  - Delete notifications
  - Real-time polling or SSE (if backend supports)

---

### Phase 4: User Profile & Settings (Week 4)
**Goal**: Complete user profile, settings, analytics

#### 4.1 User Profile Pages
- [ ] Build public profile page (`/profile/[id]`) with:
  - Cover image, avatar, bio, stats
  - Tabs: Posts, About, Activity
  - Follow button
  - Social links
- [ ] Build user posts tab with pagination and filters
- [ ] Build author card component for post cards

#### 4.2 Settings Pages (`/profile/settings`)
- [ ] Profile tab: username, bio, location, website, social links, cover/avatar upload
- [ ] Account tab: email change (2-step verification), password change
- [ ] Privacy tab: profile visibility, email visibility, follow permissions
- [ ] Notifications tab: per-type toggles
- [ ] Preferences tab: language, timezone, theme
- [ ] Danger zone: delete account
- [ ] Implement `useUser` hook for settings

#### 4.3 User Analytics Dashboard (`/analytics`)
- [ ] Overview cards: total posts, views, likes, comments
- [ ] Charts: views over time, top posts
- [ ] Posts table with per-post analytics
- [ ] Implement `useAnalytics` hook

#### 4.4 Reading History
- [ ] Build history page (`/history`) with:
  - List of read posts with last read time
  - Clear history / remove item
- [ ] Track reading history automatically on post view

---

### Phase 5: AI Writing Assistant (Week 5)
**Goal**: Deep AI integration in editor and standalone tools

#### 5.1 AI Panel in Editor
- [ ] Build `AIPanel` component (sidebar in editor)
- [ ] Implement all 16 AI endpoints via `useAI` hook:
  - Generate Post (topic → full post)
  - Title Suggestions
  - Improve Title
  - Generate Excerpt
  - Generate Tags
  - Generate SEO
  - Improve Writing
  - Rewrite (tone selection)
  - Expand Content
  - Shorten Content
  - Continue Writing
  - Summarize
  - Generate FAQ
  - Generate Social Posts
  - Generate Suggestions
  - Apply Suggestions
- [ ] Add loading states, token usage display
- [ ] Insert AI output at cursor position
- [ ] Show AI generation history

#### 5.2 Standalone AI Tools Page
- [ ] Create `/ai-tools` page with all AI features accessible
- [ ] Useful for quick tasks without full editor

---

### Phase 6: Admin Dashboard (Week 6)
**Goal**: Admin-only features

#### 6.1 Admin Layout & Protection
- [ ] Create admin route guard (check ADMIN role)
- [ ] Build admin layout with sidebar navigation

#### 6.2 Admin Pages
- [ ] Dashboard: platform stats, charts
- [ ] User Management: list, search, role change, ban/unban, verify
- [ ] Post Management: list, delete, archive, feature, pin
- [ ] Comment Moderation: list, hide, approve, delete
- [ ] Media Management: list, delete, orphaned media cleanup
- [ ] Analytics: enhanced platform analytics
- [ ] Announcements: create, list, delete
- [ ] Audit Logs: view, stats
- [ ] Platform Settings: view, update

---

### Phase 7: Polish & Production Ready (Week 7)
**Goal**: Responsive design, accessibility, performance, testing

#### 7.1 Responsive Design
- [ ] Mobile-first CSS for all components
- [ ] Breakpoints: 640px, 768px, 1024px, 1280px
- [ ] Touch-friendly interactions
- [ ] Collapsible sidebar on mobile
- [ ] Responsive post grid (1 col mobile, 2 tablet, 3 desktop)

#### 7.2 Accessibility (WCAG 2.1 AA)
- [ ] Semantic HTML throughout
- [ ] ARIA labels and roles
- [ ] Focus management (modals, dropdowns)
- [ ] Keyboard navigation
- [ ] Color contrast ratios
- [ ] Alt text for images
- [ ] Screen reader announcements for dynamic content

#### 7.3 Performance Optimization
- [ ] Image optimization (Next.js Image component)
- [ ] Code splitting (dynamic imports for heavy components)
- [ ] React Query caching and prefetching
- [ ] Virtualized lists for long feeds
- [ ] Bundle analysis and optimization

#### 7.4 Dark Mode
- [ ] CSS variables for light/dark themes
- [ ] Theme toggle in header and settings
- [ ] Persist preference in localStorage + sync with server

#### 7.5 Error Handling & Edge Cases
- [ ] Global error boundary
- [ ] Network error toasts
- [ ] Empty states for all lists
- [ ] 404 page
- [ ] 500 page
- [ ] Offline detection

#### 7.6 Testing
- [ ] Unit tests for utilities and hooks
- [ ] Component tests for key UI components
- [ ] Integration tests for critical flows (auth, post creation)
- [ ] E2E tests for main user journeys

---

## API Integration Mapping

| Feature | Backend Endpoints | Frontend Service |
|---------|------------------|------------------|
| Auth | `/api/auth/*` | `features/auth/authService.ts` |
| Posts (CRUD) | `/api/posts` | `features/posts/postService.ts` |
| Post Search | `/api/posts/search` | `features/posts/postService.ts` |
| Post SEO | `/api/posts/:id/seo` | `features/posts/postService.ts` |
| Comments | `/api/posts/:postId/comments`, `/api/comments/:id/*` | `features/comments/commentService.ts` |
| Likes | `/api/posts/:id/like`, `/api/comments/:id/like` | `features/likes/likeService.ts` |
| Follow | `/api/users/:userId/follow*` | `features/follow/followService.ts` |
| Bookmarks | `/api/posts/:id/bookmark*`, `/api/me/bookmarks` | `features/bookmarks/bookmarkService.ts` |
| Notifications | `/api/notifications/*` | `features/notifications/notificationService.ts` |
| Search | `/api/search/*` | `features/search/searchService.ts` |
| Tags | `/api/tags*` | `features/tags/tagService.ts` |
| Users | `/api/users/:id/posts`, `/api/me/settings*` | `features/users/userService.ts` |
| History | `/api/me/history*` | `features/history/historyService.ts` |
| Media | `/api/me/media*`, `/api/media*` | `features/media/mediaService.ts` |
| AI | `/api/ai/*` | `features/ai/aiService.ts` |
| Analytics | `/api/me/analytics*`, `/api/posts/:id/analytics` | `features/analytics/analyticsService.ts` |
| Admin | `/api/admin/*` | (separate admin service) |

---

## Key Technical Decisions

### State Management
- **Server State**: React Query (TanStack Query) for all API data
- **Client State**: React Context for auth, theme, toasts
- **Form State**: React Hook Form with Zod resolvers
- **Editor State**: TipTap's internal state + localStorage for drafts

### Data Fetching Strategy
- **Queries**: Stale-while-revalidate, cache time 5min, refetch on window focus
- **Mutations**: Optimistic updates for likes, bookmarks, follows, comments
- **Invalidation**: Smart invalidation on mutations (invalidate related queries)

### Error Handling
- Custom `ApiError` class matching backend format
- Global error boundary for React errors
- Toast notifications for API errors
- Form-level validation errors from Zod

### Image Handling
- Upload via `/api/media` (returns URL)
- Display via Next.js Image component with Supabase/local domain config
- Blur placeholders for better UX

### Real-time Feel
- Optimistic updates for all mutations
- Polling for notifications (30s interval)
- No WebSocket needed for MVP

---

## Environment Variables

```env
# client/.env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Dependencies to Install

```bash
# Core
npm install @tanstack/react-query react-hook-form @hookform/resolvers zod lucide-react date-fns clsx

# Editor
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-task-list @tiptap/extension-task-item @tiptap/extension-code-block-lowlight lowlight

# Forms & Validation
npm install zod

# Utils
npm install slugify  # or use backend slug utility

# Dev
npm install -D @types/react @types/node typescript eslint prettier
```

---

## File Creation Order (Suggested)

1. **Config & Types**: `lib/api.ts`, `lib/queryClient.ts`, `types/*`, `lib/validations.ts`, `lib/constants.ts`
2. **Auth**: `features/auth/*`, `components/forms/LoginForm.tsx`, `components/forms/RegisterForm.tsx`, auth pages
3. **Layout**: `components/layout/*`, providers, root layout
4. **UI Components**: `components/ui/*` (all base components)
5. **Posts**: `features/posts/*`, `components/post/*`, home page, post page
6. **Search**: `features/search/*`, `components/search/*`, search page, tag page
7. **Editor**: `components/editor/*`, create/edit pages
8. **Comments**: `features/comments/*`, `components/comment/*`
9. **Social**: `features/likes/*`, `features/follow/*`, `features/bookmarks/*`, `features/notifications/*`
10. **Profile & Settings**: `features/users/*`, `components/user/*`, profile pages, settings pages
11. **Analytics**: `features/analytics/*`, `components/analytics/*`
12. **AI**: `features/ai/*`, `components/editor/AIPanel.tsx`
13. **Admin**: Admin layout, pages
14. **Polish**: Responsive, dark mode, accessibility, testing

---

## Success Criteria

- [ ] All 108 backend endpoints have frontend integration
- [ ] Fully responsive (mobile, tablet, desktop)
- [ ] Dark mode support
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Performant (Lighthouse > 90)
- [ ] Type-safe (no `any` types)
- [ ] Error boundaries and graceful error handling
- [ ] Optimistic UI for all mutations
- [ ] Comprehensive test coverage (>80%)
- [ ] Production build passes without errors

---

## Questions for Clarification

1. **Styling Approach**: CSS Modules (current) or Tailwind CSS? The architecture mentions CSS Modules but Tailwind would speed up UI development significantly.

2. **Real-time**: Should we implement WebSocket/SSE for notifications and live updates, or is polling sufficient for MVP?

3. **Editor**: TipTap is specified in architecture. Any preference for additional extensions (tables, code blocks with syntax highlighting, math)?

4. **Charts**: For analytics dashboard - Chart.js, Recharts, or Tremor?

5. **Image Storage**: Currently local provider. Should frontend handle direct upload to Supabase/S3 in future, or always proxy through backend?

6. **Testing**: Preferred test framework? Vitest + React Testing Library + Playwright for E2E?

7. **Deployment**: Will frontend be deployed separately or with backend via Docker Compose?