# AI Design & Integration

## Vision

PixelThread is designed to be an **AI-native blogging platform**. AI is not a bolt-on feature — it is a core part of the product, deeply integrated into the content creation, optimization, and management workflow.

---

## AI Features (Planned)

### 1. AI Blog Generation

Users can provide a topic or keywords and have the AI generate a full blog post draft. The generation is logged in the `AIGeneration` table with `type: BLOG`.

### 2. SEO Optimization

After a post is created, the AI analyzes the content and suggests:

- A meta title and description
- Relevant keywords
- A canonical URL
- An SEO score (stored on the `SeoMeta` model)

Generation logged with `type: SEO`.

### 3. Title Suggestions

Users can input a topic and receive multiple AI-generated title options. Logged with `type: TITLE`.

### 4. Content Rewriting

Users can select sections of their post and request a rewrite for clarity, tone, or length. Logged with `type: REWRITE`.

---

## Data Model

All AI interactions are persisted in the `AIGeneration` table:

```prisma
model AIGeneration {
  id        String           @id @default(cuid())
  userId    String
  postId    String?
  type      AIGenerationType  // BLOG | SEO | REWRITE | TITLE
  prompt    String
  response  String
  createdAt DateTime         @default(now())
}

enum AIGenerationType {
  BLOG
  SEO
  REWRITE
  TITLE
}
```

This gives us a full audit trail of every AI interaction, enabling future features like prompt history, regeneration, and user analytics.

---

## Implementation Plan

| Phase   | Feature                      | Location                             |
| ------- | ---------------------------- | ------------------------------------ |
| Phase 1 | AI service abstraction layer | `server/src/lib/ai/`                 |
| Phase 1 | AI generation API endpoint   | `server/src/routes/ai.js`            |
| Phase 2 | SEO scoring integration      | `server/src/services/seo.service.js` |
| Phase 3 | Frontend AI generation UI    | `client/src/features/ai/`            |
| Phase 3 | Post editor AI panel         | `client/src/components/editor/`      |

---

## Design Principles

- **Transparency**: Every AI call is logged and attributable to a user and post.
- **Non-destructive**: AI generates suggestions; the user always has final control.
- **Modular**: The AI service lives in its own isolated layer (`lib/ai/`) and is accessible to any part of the server.
- **Type-safe**: All generation types are enforced via the `AIGenerationType` enum in Prisma.
