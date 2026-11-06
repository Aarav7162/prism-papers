<div align="center">

# PRISM Backend

### Examination Cockpit, Past-Paper Solver & Progress Tracker Engine

[![Next.js 15](https://img.shields.io/badge/Next.js-15_(App_Router)-000000?style=flat&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase%20%7C%20Neon-336791?style=flat&logo=postgresql)](https://supabase.com/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-Zero--Egress%20S3-F38020?style=flat&logo=cloudflare)](https://www.cloudflare.com/products/r2/)
[![Cost Baseline](https://img.shields.io/badge/Cost_Target-$0%2Fmonth%20Free%20Tier-success)](#operational-constraints--cost-model)

</div>

---

## 📖 Overview

PRISM is an open-source examination cockpit and past-paper solver engineered to help students conquer standardized board exams (CBSE, Cambridge IGCSE, ICSE/ISC, and IB).

This repository contains the complete **production-ready backend API and data engine**, built with Next.js 15 App Router, PostgreSQL via Prisma ORM, and Cloudflare R2 object storage.

Frontend repository: [github.com/Aarav7162/prism-papers](https://github.com/Aarav7162/prism-papers)

---

## 🏛️ Architectural Highlights & Operational Constraints

1. **Strict $0/Month Free-Tier Cost Baseline:**
   - **Zero Binary Proxying:** Binary PDFs are **never** proxied through Next.js serverless functions or edge nodes.
   - **Pre-signed R2 Streaming:** All PDF views and downloads use `@aws-sdk/s3-request-presigner` to issue short-lived (15-minute / 900s) presigned URLs directly from Cloudflare R2 (zero egress fees).
2. **Local-First Offline Sync Bridge:**
   - Full support for browser `localStorage` local-first editing.
   - `/api/user/progress/sync` handles batched atomic upserts with a merge conflict resolution rule: **preserve record with higher `updatedAt` timestamp or higher `scoreAchieved`**.
3. **Database & Connection Management:**
   - Single Prisma client singleton (`lib/prisma.ts`) guarded against Next.js hot-reloading pool leaks.
   - Separate connection string pooling (`DATABASE_URL`) for transaction poolers (Supabase / Neon) and `DIRECT_URL` for migrations.
4. **Weakness & Analytics Engine:**
   - Real-time aggregation of subject completion rates and question topic weakness tags (`WEAK` < 50%, `MODERATE` 50–75%, `STRONG` > 75%).

---

## 🗄️ Relational Schema (`prisma/schema.prisma`)

```mermaid
erDiagram
    Board ||--o{ Subject : has
    Subject ||--o{ Paper : contains
    Paper ||--o{ Question : includes
    Paper ||--o{ UserProgress : tracks
    Paper ||--o{ Bookmark : saves
    Paper ||--o| Paper : "markSchemeId (self-link)"
    User ||--o{ UserProgress : attempts
    User ||--o{ Bookmark : favorites
```

### Models
- `Board`: `id` (slug: `cbse`, `igcse`, `icse`, `ib`), `name`, `isActive` (`false` for `ib` as "Coming Soon").
- `Subject`: `id`, `boardId`, `name`, `code` (e.g. `0580`, `041`), `gradeLevel` (`Class 10`, `Class 12`, `IGCSE`).
- `Paper`: `id`, `subjectId`, `year`, `session`, `variant`, `paperType` (`QUESTION_PAPER`, `MARK_SCHEME`, `EXAMINER_REPORT`), `fileKey`, `totalMarks`, `durationMins`, `markSchemeId`.
- `Question`: `id`, `paperId`, `questionNum`, `maxMarks`, `topicTags` (`String[]`), `rubricJson` (`M1`, `A1`, `B1` sub-rubrics).
- `UserProgress`: `id`, `userId`, `paperId`, `status` (`UNATTEMPTED`, `IN_PROGRESS`, `SOLVED`, `REVIEW_NEEDED`), `scoreAchieved`, `timeSpentSecs`, `answersJson`, `updatedAt`.
- `Bookmark`: `id`, `userId`, `paperId`, `createdAt`.

---

## 🔌 API Route Specifications

All endpoints return uniform response envelopes:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}
```

### 1. Catalog & Discovery
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/boards` | List active examination boards and subject counts (`?includeInactive=true` for IB) |
| `GET` | `/api/papers` | Filterable paper search (`boardId`, `subjectId`, `year`, `session`, `variant`, `paperType`, `limit`, `page`, `cursor`) |
| `GET` | `/api/papers/[id]` | Full paper metadata, associated questions, and linked mark scheme |

### 2. Zero-Egress Cloudflare R2 Presigned Access
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/papers/[id]/view` | Generates 15-minute inline pre-signed R2 URL (`?redirect=true` for 307 direct redirect) |
| `GET` | `/api/papers/[id]/download` | Generates 15-minute attachment pre-signed R2 URL (`?redirect=true` for 307 download) |
| `POST` | `/api/papers/batch-download` | Accepts `{ paperIds: string[], zipStream?: boolean }`. Returns array of presigned URLs or streams dynamic `.zip` index without memory exhaustion. |

### 3. User Progress & Offline Sync Bridge
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/user/progress` | Fetches authenticated user's completion matrix, scores, and active papers |
| `POST` | `/api/user/progress/sync` | Syncs `localStorage` state into PostgreSQL with atomic upserts and merge conflict precedence |
| `PATCH` | `/api/user/progress/[paperId]` | Real-time incremental auto-save (question marks, time elapsed, status, scratchpad strokes) |
| `GET` | `/api/user/bookmarks` | List bookmarked papers |
| `POST` | `/api/user/bookmarks` | Bookmark paper (`{ paperId: string }`) |
| `DELETE` | `/api/user/bookmarks/[paperId]` | Remove bookmark |

### 4. Analytics & Weakness Heatmap
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/user/analytics` | Aggregates subject completion rate, average scores, and topic weakness tags ranked by lowest accuracy |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (v22 recommended)
- PostgreSQL database (Supabase or Neon free tier)
- Cloudflare R2 bucket (`prism-papers`)

### 2. Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/prism?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/prism?schema=public"
R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET_NAME="prism-papers"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

### 3. Database Migration & Seeding
```bash
# Push schema or run migration
npx prisma db push
# or: npx prisma migrate deploy

# Seed boards, core subjects, and 2021-2024 past papers with sub-rubrics
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the API dashboard and explore endpoints.

### 5. Run Verification & Test Suite
```bash
npx tsx tests/test-backend.ts
npm run build
```

---

## 🔒 Security & Architecture Decisions
- **Zero Heavy Binary Buffers:** PDFs stream directly from R2 to client devices.
- **Strict Zod Parsing:** Every API route strictly validates query parameters and JSON payloads.
- **Strict TypeScript:** No `any` type escapes across library interfaces and route handlers.
- **Merge Precedence:** Deterministic offline reconciliation protects students from losing locally drawn canvas notes or higher scores.
