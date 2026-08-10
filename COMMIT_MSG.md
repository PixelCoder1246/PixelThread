feat: Full frontend implementation + AI/editor overhaul (post v1.1.0)

## Summary
Complete frontend build-out from zero to production-ready blogging platform,
plus major AI system fixes and editor redesign.

## 1. Frontend Created from Scratch (Next.js 16, React 19, TypeScript)
**Route Groups & Layouts:**
- (auth): login, register, forgot/reset password, verify email
- (app): feed, profile, bookmarks, history, notifications, settings, search, trending
- (editor): create post, edit post (TipTap with slash commands)
- (dashboard): analytics, admin panels (users, posts, reports, logs, settings)
- (public): landing page, explore
- Shared layouts: AuthLayout, AppLayout, EditorLayout, PublicLayout, DashboardLayout

**UI Component Library (20+ components):**
Button, Input, Card, Dialog, Dropdown, Tabs, Tooltip, Select, Switch, Table,
Avatar, Badge, Spinner, Skeleton, Textarea, Input, Dialog, Dropdown, Tabs,
Tooltip, Switch, Modal, CommandPalette, Toast, UserMenu, Pagination, etc.

**State & API:**
- Zustand stores: auth (user, tokens, loading), ui (sidebar, command palette)
- Axios with interceptors: auto token refresh, 401 handling, per-request timeouts
- Service layer: ai, auth, posts, comments, likes, follows, bookmarks, notifications, analytics, etc.

## 2. AI System Complete Overhaul
- **Model switch:** `nemotron-3-ultra` (22-40s, reasoning) → `meta/llama-3.1-70b-instruct` (~2s)
- **Timeouts:** Server 60s→180s, Client AI 30s→180s (dedicated `aiApi` axios instance)
- **Error handling:** `ApiError` mapping for 403/429/timeout/key-missing (no more raw 500)
- **API key:** `NVIDIA_API_KEY` in server/.env (required for llama model)
- All 14 AI endpoints functional: generatePost, titles, improve, excerpt, tags, SEO, rewrite, expand, shorten, continue, summarize, FAQ, social, suggestions

## 3. Post Creation/Edit Layout Redesign
- **Editor full width** (flex:1), right rail = slide-over panel (fixed 320px, transform slide)
- **AI Assistant** permanent in right rail, toggle via bottom bar (⌘A)
- **Settings** collapsed into drawer (⌘, / Settings button)
- **Bottom bar:** Save indicator (left) | Settings / AI / Shortcuts / Word count / Reading time (right)
- Identical layout on both `/posts/create` and `/posts/[slug]/edit`

## 4. Editor Fixes (TipTap)
- FloatingToolbar link input no longer closes on blur (checks toolbar ref in onBlur)
- Content sync loop fixed (only setContent when HTML differs)
- BubbleMenu/FloatingToolbar/EditorToolbar all receive editor correctly
- Keyboard shortcuts: ⌘S save, ⌘A AI, ⌘, settings, ⌥I/T/G/E AI actions
- Slash commands, tables, images, code blocks, highlighting functional

## 5. Landing Page & UX Polish
- Removed "Comments" & "Reads" stats, centered "Active writers" + "Posts created"
- Trending Topics widget removed from post pages (new (posts) route group)
- `data-scroll-behavior="smooth"` on `<html>` for Next.js scroll restoration
- AnimatedCounter, TypingAnimation, TestimonialCarousel all functional

## 6. Notifications
- Unread count fetching in (app)/layout.tsx via `notificationsService.getUnreadCount()`
- Badge in AppHeader/MobileNav with 99+ cap

## 7. Cleanup
- Removed test files: `server/test-ai2.js`, `API_MAPPING_REPORT.txt`
- Environment: `NVIDIA_API_KEY` required in server/.env (llama model)

## Verification
```bash
cd client && npm run build   # ✓ passes
cd client && npx tsc --noEmit  # ✓ clean
```