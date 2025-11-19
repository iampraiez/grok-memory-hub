# Grok Memory Hub – Backend

### Permanent, cross-conversation memory for Grok-4 (built with real xAI API)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-000000?logo=fastify&logoColor=white)](https://fastify.io/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)](https://prisma.io/)
[![Grok API](https://img.shields.io/badge/Grok%20API-xAI-00A3E0)](https://x.ai/api)

**Live Demo** → _(coming soon)_  
**Built by @satoru707** – a solo developer who refused to let Grok forget.

---

## Why This Exists

As of November 2025, **official Grok still has zero long-term memory**.  
Every new chat = amnesia.

This backend turns Grok into a **true second brain**:

- Unlimited conversations
- Full-text + semantic search across all history
- Smart RAG – only injects relevant memories (low token usage)
- Multiple chats, one brain
- Future-ready for file uploads, projects, sharing, voice, etc.

This is the #1 missing feature in Grok.  
I'm fixing it in public.

---

## Core Features (Backend)

| Feature                                    | Status  | Description                                                                   |
| ------------------------------------------ | ------- | ----------------------------------------------------------------------------- |
| Real Grok-4 API integration                | Done    | Streaming responses via `api.x.ai/v1` (OpenAI-compatible)                     |
| Permanent message storage                  | Done    | PostgreSQL + Prisma – every message forever                                   |
| Multi-conversation support                 | Done    | Users can create unlimited chats like official Grok, but everything is linked |
| Global full-text search                    | Done    | Search every word you ever said to Grok                                       |
| Smart RAG (Retrieval-Augmented Generation) | Done    | Only injects relevant past snippets → keeps context small & cheap             |
| Clerk Auth (X/Twitter login)               | Done    | Zero-boilerplate, production-grade authentication                             |
| Streaming responses                        | Done    | Real-time token streaming (feels instant)                                     |
| Rate limiting & usage tracking             | Planned | Prevent abuse, show user quota                                                |
| File & image memory                        | Planned | Upload once → reference forever                                               |
| Shareable conversation links               | Planned | Public read-only or edit links                                                |

---

## Tech Stack (Backend)

| Layer      | Technology                | Why we chose it                               |
| ---------- | ------------------------- | --------------------------------------------- |
| Language   | TypeScript                | Type safety + best devex                      |
| Framework  | Fastify                   | Faster than Express, built-in validation      |
| ORM        | Prisma + PostgreSQL       | Best DX in 2025, schema migrations, type-safe |
| Auth       | Clerk                     | X/Twitter login, free tier forever            |
| LLM        | Grok-4 (official xAI API) | Real Grok,model                               |
| Deployment | Railway / Fly.io / Render | Free Postgres + global edge                   |

---

## Project Structure (Backend)

backend/
├── src/
│ ├── routes/ # All API endpoints
│ ├── services/ # Grok API, RAG logic, embeddings
│ ├── middleware/ # Auth protection
│ └── main.ts # Server entry
├── prisma/
│ └── schema.prisma # Users, Conversations, Messages
└── package.json
text---

## API Endpoints (v1)

| Method | Endpoint                          | Description                            |
| ------ | --------------------------------- | -------------------------------------- |
| GET    | `/api/conversations`              | List all user conversations            |
| POST   | `/api/conversations`              | Create new conversation                |
| GET    | `/api/conversations/:id/messages` | Load messages for a conversation       |
| POST   | `/api/chat`                       | Main streaming endpoint (with memory)  |
| GET    | `/api/search?q=...`               | Global search across all conversations |
| GET    | `/health`                         | Health check                           |

---

## Environment Variables (`.env`)

```env
# Database
DATABASE_URL=postgresql://...

# Grok API (real xAI)
GROK_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GROK_BASE_URL=https://api.x.ai/v1

# Auth
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```
