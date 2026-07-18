# AI Design & Integration

## Vision

PixelThread is designed to be an **AI-native blogging platform**. AI is not a bolt-on feature — it is a core part of the product, deeply integrated into the content creation, optimization, and management workflow.

---

## AI Features (Implemented)

All AI endpoints are fully implemented and available at `/api/ai`. Each endpoint requires authentication via `accessToken` cookie and is rate-limited to **10 requests per minute** per user.

| # | Endpoint | Description |
|---|---|---|
| 1 | `POST /api/ai/generate-post` | Generate a complete blog post from a topic (type: `BLOG`) |
| 2 | `POST /api/ai/title` | Generate title suggestions from content (type: `TITLE`) |
| 3 | `POST /api/ai/title/improve` | Improve an existing title (type: `TITLE`) |
| 4 | `POST /api/ai/excerpt` | Generate a post excerpt/summary (type: `EXCERPT`) |
| 5 | `POST /api/ai/tags` | Generate relevant tags from content (type: `TAGS`) |
| 6 | `POST /api/ai/seo` | Generate SEO metadata (type: `SEO`) |
| 7 | `POST /api/ai/improve` | Improve writing quality (type: `IMPROVE`) |
| 8 | `POST /api/ai/rewrite` | Rewrite content in a different tone (type: `REWRITE`) |
| 9 | `POST /api/ai/expand` | Expand/section-break content (type: `EXPAND`) |
| 10 | `POST /api/ai/shorten` | Shorten/condense content (type: `SHORTEN`) |
| 11 | `POST /api/ai/continue` | Continue writing from where content ends (type: `CONTINUE`) |
| 12 | `POST /api/ai/summarize` | Generate a summary of provided content (type: `SUMMARIZE`) |
| 13 | `POST /api/ai/faq` | Generate FAQ entries from content (type: `FAQ`) |
| 14 | `POST /api/ai/social` | Generate social-media posts from content (type: `SOCIAL`) |
| 15 | `POST /api/ai/suggestions` | Generate topic/content suggestions (type: `SUGGESTIONS`) |
| 16 | `POST /api/ai/suggestions/apply` | Apply AI suggestions directly to content (type: `APPLY_SUGGESTIONS`) |

---

## Data Model

All AI interactions are persisted in the `AIGeneration` table:

```prisma
model AIGeneration {
  id        String           @id @default(cuid())
  userId    String
  postId    String?
  type      AIGenerationType  // BLOG | SEO | REWRITE | TITLE | EXCERPT | TAGS | IMPROVE | EXPAND | SHORTEN | CONTINUE | SUMMARIZE | FAQ | SOCIAL | SUGGESTIONS | APPLY_SUGGESTIONS
  prompt    String
  response  String
  createdAt DateTime         @default(now())
}

enum AIGenerationType {
  BLOG
  SEO
  REWRITE
  TITLE
  EXCERPT
  TAGS
  IMPROVE
  EXPAND
  SHORTEN
  CONTINUE
  SUMMARIZE
  FAQ
  SOCIAL
  SUGGESTIONS
  APPLY_SUGGESTIONS
}
```

This gives us a full audit trail of every AI interaction, enabling future features like prompt history, regeneration, and user analytics.

---

## Implementation Status

| Phase   | Feature                      | Location                                | Status       |
| ------- | ---------------------------- | --------------------------------------- | ------------ |
| Phase 1 | AI service abstraction layer | `server/src/modules/ai/ai.service.js`   | ✅ Complete |
| Phase 1 | AI generation API endpoints  | `server/src/modules/ai/ai.routes.js`    | ✅ Complete |
| Phase 2 | SEO scoring integration      | `server/src/services/seo/seo.service.js` | ✅ Complete |
| Phase 3 | Frontend AI generation UI    | `client/src/features/ai/`               | 🏗️ In progress |
| Phase 3 | Post editor AI panel         | `client/src/components/editor/`         | 🏗️ In progress |

---

## Design Principles

- **Transparency**: Every AI call is logged and attributable to a user and post.
- **Non-destructive**: AI generates suggestions; the user always has final control.
- **Modular**: The AI service lives in its own isolated module (`server/src/modules/ai/`) and is accessible to any part of the server.
- **Type-safe**: All generation types are enforced via the `AIGenerationType` enum in Prisma.
