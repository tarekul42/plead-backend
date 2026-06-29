# PropLead AI — Backend API

> AI-powered REST API for real estate lead management, property matching, and marketing copy generation. Built with Express + TypeScript + MongoDB.

[![CI](https://github.com/tarekul42/plead-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/tarekul42/plead-backend/actions/workflows/ci.yml)
![Bun](https://img.shields.io/badge/Bun-1.x-black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)
![Express](https://img.shields.io/badge/Express-5.2-259dff)

---

## 📋 Overview

PropLead is a multi-tenant SaaS platform that helps real estate agencies manage leads, showcase properties, and leverage AI for lead-property matching and marketing copy generation. The backend provides a fully-featured REST API with RBAC (Agent / Manager / Admin), agency-scoped data isolation, Clerk-powered authentication, and pluggable AI providers with automatic fallback.

---

## ✨ Main Features

| Feature | Description |
|---------|-------------|
| **Multi-tenant SaaS** | Agency-scoped data with full isolation between tenants |
| **RBAC** | Agent / Manager / Admin roles integrated with Clerk |
| **Lead Management** | Full CRUD with pipeline tracking (New → Contacted → Qualified → Won → Lost) |
| **Property Listings** | CRUD, search, filters, pagination, MongoDB text index, geolocation |
| **Interaction Tracking** | Log calls, emails, meetings, SMS, property viewings per lead |
| **AI Lead-Property Matching** | Score leads against inventory with natural language reasons |
| **AI Copy Generator** | Property descriptions + outreach emails with tone selection |
| **AI Provider Fallback** | Gemini primary → Groq fallback → rule-based scoring |
| **Caching** | In-memory LRU cache for AI responses (configurable TTL) |
| **Audit Logging** | Every AI generation logged to `ai_analyses` collection |
| **Blog Management** | Draft/publish workflow with markdown support |
| **Review Moderation** | Admin approval queue with flagging system |
| **Admin Dashboard API** | Platform-wide stats, user management, AI usage analytics |
| **Webhook Sync** | Clerk user.created / user.updated / user.deleted → local `users` collection |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 18+ / Bun |
| Framework | Express 5 |
| Language | TypeScript 6 |
| Database | MongoDB + Mongoose 9 |
| Authentication | Clerk (`@clerk/express`) |
| AI Providers | Google Gemini (primary), Groq (fallback), OpenRouter |
| Validation | Zod 4 |
| Rate Limiting | express-rate-limit |
| Logging | Pino + Pino-Pretty |
| File Storage | Cloudinary (multer) |
| Caching | LRU Cache |
| Error Tracking | Sentry |
| Webhooks | Svix (Clerk webhook verification) |

---

## 📦 Main Dependencies

### Runtime

`@clerk/express`, `cors`, `cookie-parser`, `dotenv`, `express`, `express-mongo-sanitize`, `express-rate-limit`, `helmet`, `hpp`, `lru-cache`, `mongoose`, `multer`, `pino`, `pino-http`, `pino-pretty`, `sanitize-html`, `svix`, `zod`

### Dev

`typescript`, `tsx`, `@types/*`, `eslint`, `prettier`, `jest`, `ts-jest`, `supertest`, `mongodb-memory-server`, `@vercel/node`

---

## 🚀 Run Locally

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) M0 cluster (free) or local MongoDB
- [Clerk](https://clerk.com/) account (free tier)
- [Google Gemini](https://aistudio.google.com/) API key (free tier)
- [Cloudinary](https://cloudinary.com/) account (free tier)

### Setup

```bash
# 1. Clone
git clone https://github.com/tarekul42/plead-backend.git
cd plead-backend

# 2. Install dependencies
bun install

# 3. Configure environment
cp .env.example .env
# Edit .env with your keys (see table below)

# 4. Seed demo data
bun run seed

# 5. Start dev server
bun run dev
```

Server starts at `http://localhost:8080` (or your configured `PORT`).

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `NODE_ENV` | Environment | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/plead` |
| `CLERK_SECRET_KEY` | Clerk secret key (starts with `sk_`) | `sk_test_xxx` |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret | `whsec_xxx` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaXxx` |
| `GEMINI_MODEL` | Gemini model name | `gemini-1.5-flash` |
| `GROQ_API_KEY` | Groq API key (optional fallback) | `gsk_xxx` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:3000,https://plead.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `xxx` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `xxx` |
| `SENTRY_DSN` | Sentry DSN (optional) | `https://xxx@ingest.sentry.io/xxx` |

### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server with hot reload |
| `bun run build` | Compile TypeScript to `dist/` |
| `bun run start` | Start production server |
| `bun run typecheck` | Type-check without emitting |
| `bun run lint` | Lint all source files |
| `bun run test` | Run tests (Jest) |
| `bun run seed` | Seed database with demo data |

---

## 👥 Demo Credentials

After running the seed script, the following demo accounts are available:

| Role | Email | Password |
|------|-------|----------|
| **Agent** | `agent@proplead.ai` | `Ag7$k9mX!pQ2` |
| **Manager** | `manager@proplead.ai` | `Mgr8$jL3!nR5` |
| **Admin** | `admin@proplead.ai` | `Adm4$vB7!wX1` |

---

## 📁 Project Structure

```
src/
├── app.ts                          # Express app configuration
├── server.ts                       # Server entry point (DB connect + listen)
├── core/
│   ├── config/                     # Database, environment, upload config
│   ├── constants.ts                # App-wide constants (roles, statuses, types)
│   ├── helpers/                    # Error transformation utilities
│   ├── middleware/                 # Auth, RBAC, validation, error handling, rate limiting
│   ├── plugins/                    # Mongoose plugins (audit, soft delete)
│   ├── types/                      # TypeScript type definitions
│   └── utils/                      # Shared utilities (API response, pagination, logger)
├── modules/                        # Feature modules
│   ├── admin/                      # Platform-wide stats, user management
│   ├── agencies/                   # Agency management
│   ├── ai/                         # AI providers, prompts, analysis models
│   ├── auth/                       # Clerk webhook sync routes
│   ├── blogs/                      # Blog CRUD with draft/publish
│   ├── interactions/               # Lead interaction tracking
│   ├── leads/                      # Lead CRUD with pipeline
│   ├── properties/                 # Property CRUD with search/filters
│   ├── reviews/                    # Review moderation
│   ├── users/                      # User management
│   └── webhooks/                   # Clerk webhook handlers
└── test/                           # Test setup and env config
```

---

## 🔗 Links

| Resource | URL |
|----------|-----|
| 🌐 **Live API** | https://plead-api.onrender.com |
| 🖥️ **Frontend Repo** | https://github.com/tarekul42/plead-frontend |
| 🌍 **Live App** | https://plead.vercel.app |
| 📧 **Contact** | tarekulrifat142@gmail.com |

---

## 📄 License

MIT © Tarekul Islam Rifat

---

<div align="center">

**⭐ If this project helped you, give it a star!**

Built by [Tarekul Islam Rifat](https://github.com/tarekul42)

</div>
