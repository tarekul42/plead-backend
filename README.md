# PropLead AI — Backend API

AI-powered REST API for real estate lead management, property matching, and marketing copy generation. Built with Express + TypeScript + MongoDB.

---

## Technologies

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Runtime        | Node.js 18+ / Bun                   |
| Framework      | Express 5 + TypeScript 6            |
| Database       | MongoDB + Mongoose 9                |
| Auth           | Clerk Express SDK (`@clerk/express`) |
| AI Providers   | Google Gemini (primary), Groq (fallback) |
| Validation     | Zod                                 |
| Rate Limiting  | express-rate-limit                  |
| Logging        | Pino                                |
| File Storage   | Cloudinary                          |
| Error Tracking | Sentry                              |

## Features

- **Multi-tenant SaaS** — Agency-scoped data, full data isolation between tenants
- **RBAC** — Agent / Manager / Admin roles with Clerk integration
- **Lead Management** — Full CRUD with pipeline tracking (New → Contacted → Qualified → Won → Lost)
- **Property Listings** — CRUD, search, filters, pagination, text index
- **Interaction Tracking** — Log calls, emails, meetings, SMS, property viewings
- **AI Lead-Property Matching** — Score leads against inventory with natural language reasons
- **AI Copy Generator** — Property descriptions + outreach emails with tone selection
- **AI Provider Fallback** — Gemini primary → Groq fallback → rule-based scoring
- **Caching** — In-memory LRU cache for AI responses (configurable TTL)
- **Audit Logging** — Every AI generation logged to `ai_analyses` collection
- **Blog Management** — Draft/publish workflow
- **Review Moderation** — Admin approval queue
- **Admin Dashboard API** — Platform-wide stats, user management, AI usage analytics
- **Webhook Sync** — Clerk user.created / user.updated / user.deleted → local `users` collection

## Dependencies

### Production
`@clerk/express`, `@sentry/node`, `cloudinary`, `cors`, `dotenv`, `express`, `express-rate-limit`, `mongoose`, `multer`, `pino`, `pino-pretty`, `svix`, `zod`

### Dev
`typescript`, `tsx`, `@types/*`, `eslint`, `prettier`, `jest`, `ts-jest`, `supertest`

## Getting Started

### Prerequisites
- Bun (recommended) or Node.js 18+
- MongoDB Atlas M0 cluster (or local MongoDB)
- Clerk account (free tier)
- Google Gemini API key (free tier)
- Groq API key (free tier, optional fallback)
- Cloudinary account (free tier)

### Setup

```bash
# 1. Clone
git clone https://github.com/tarekul42/plead-backend.git
cd plead-backend

# 2. Install dependencies
bun install

# 3. Environment variables
cp .env.example .env
# Fill in your keys (see .env.example for all required vars)

# 4. Start dev server
bun run dev

# 5. Seed demo data
bun run seed
```

### Available Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `bun run dev`        | Start dev server with hot reload   |
| `bun run build`      | Compile TypeScript to `dist/`      |
| `bun run start`      | Start production server            |
| `bun run typecheck`  | Type-check without emitting        |
| `bun run lint`       | Lint all source files              |
| `bun run test`       | Run tests (Jest)                   |
| `bun run seed`       | Seed database with demo data       |

### API Base URL

```
http://localhost:8080/api/v1
```

Full API documentation is available in `scripts/postman-collection.json`.

## Deployment

Hosted on **Render Free** at:

```
https://plead-api.onrender.com
```

## Links

- **Frontend Repo**: [github.com/tarekul42/plead-frontend](https://github.com/tarekul42/plead-frontend)
- **Live API**: [plead-api.onrender.com](https://plead-api.onrender.com)
- **Live App**: [plead.vercel.app](https://plead.vercel.app)
