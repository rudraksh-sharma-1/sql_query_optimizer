# SQL Query Performance Analyzer

A full-stack web application that analyzes PostgreSQL `EXPLAIN ANALYZE` execution plans, detects performance bottlenecks, and delivers plain-language optimization suggestions. Built with the PERN stack and Supabase.

**Live Demo:** [sql-query-optimizer-frontend.vercel.app](https://sql-query-optimizer-frontend.vercel.app)

---

## Table of Contents

- [What is a PostgreSQL Execution Plan?](#what-is-a-postgresql-execution-plan)
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Core Modules](#core-modules)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Security](#security)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## What is a PostgreSQL Execution Plan?

When you run a query in PostgreSQL, the database doesn't just execute it blindly. It first builds an **execution plan** — a step-by-step strategy describing exactly how it will fetch, filter, join, and sort data to produce your result.

You can see this plan by running:

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'pending';
```

PostgreSQL returns output like this:

```
Seq Scan on orders  (cost=0.00..4821.00 rows=200000 width=48)
                    (actual time=0.032..312.445 rows=5000 loops=1)
  Filter: (status = 'pending')
  Rows Removed by Filter: 195000
Planning Time: 0.8 ms
Execution Time: 315.2 ms
```

### Reading the plan

Each line in the output is called a **node** — a single operation the database performs. Here is what each part means:

| Part | Meaning |
|---|---|
| `Seq Scan` | Operation type — sequential (full) table scan |
| `on orders` | Table being scanned |
| `cost=0.00..4821.00` | Estimated cost: startup cost `..` total cost |
| `rows=200000` | Estimated number of rows this node will return |
| `width=48` | Average row size in bytes |
| `actual time=0.032..312.445` | Actual time in ms: startup `..` end **per loop** |
| `actual rows=5000` | Actual rows returned **per loop** |
| `loops=1` | How many times this node was executed |

### Why loops matter

The most important and commonly misunderstood part of execution plans is **loops**. When a node appears inside a join, it may execute thousands of times. The time shown in the plan is **per loop**, not total.

**True total time = actualEndTime × loops**

For example:

```
Seq Scan on payments (actual time=0.050..0.300 rows=10 loops=500000)
```

- Per loop time shown: `0.300ms`
- True total time: `0.300 × 500,000 = 150,000ms = 2.5 minutes`

Without multiplying by loops you would think this is a fast operation. The analyzer handles this calculation automatically.

### Common node types

| Node | What it does | Performance |
|---|---|---|
| `Seq Scan` | Reads every row in the table | 🔴 Slow on large tables |
| `Index Scan` | Uses an index to find rows | 🟢 Fast |
| `Index Only Scan` | Reads from index without touching table | 🟢 Fastest |
| `Nested Loop` | Joins by looping through inner table for each outer row | 🟠 Risky with large datasets |
| `Hash Join` | Builds a hash table then probes it | 🟢 Good for large joins |
| `Merge Join` | Joins two pre-sorted inputs | 🟢 Good with sorted data |
| `Sort` | Sorts rows — expensive without an index | 🟠 Can be eliminated with index |
| `Hash` | Builds hash table for Hash Join | Intermediate node |
| `Aggregate` | Performs GROUP BY, COUNT, SUM, etc. | Depends on input size |

---

## Project Overview

The SQL Query Performance Analyzer solves a real problem — reading PostgreSQL execution plans is difficult and requires deep database knowledge. Most developers paste their plan into a terminal and struggle to understand what went wrong.

This tool:
1. Takes your raw `EXPLAIN ANALYZE` output
2. Parses every node into structured data
3. Calculates true costs by accounting for loops
4. Applies a rule-based detection engine
5. Returns plain-language suggestions with exact numbers
6. Saves your analysis history so you can track improvements

---

## Features

### Core Analyzer
- Paste any PostgreSQL `EXPLAIN ANALYZE` output
- Interactive tree view of the execution plan
- Each node shows: true total time, true total rows, estimated vs actual rows, cost, loops, filter, and width
- Click **More** on any node to see full per-loop breakdown
- Color-coded nodes by operation type
- Timing percentage badge showing how much of total query time each node consumed

### Rule-Based Detection Engine
The analyzer applies 6 rules to detect performance issues:

| Rule | What it detects |
|---|---|
| R1 — Repeated Sequential Scan | Seq Scan executed more than 10 times (loops > 10) |
| R2 — Nested Loop with inner Seq Scan | Nested Loop causing repeated full table scans |
| R3 — High Estimated Cost | Node cost exceeds 1000 units |
| R4 — Row Estimation Mismatch | Actual rows differ from estimated rows by more than 10× |
| R5 — Slow Operation | True total time (after loop multiplication) exceeds 100ms |
| R6 — High Filter Rejection Rate | More than 80% of scanned rows discarded by filter |

Suggestions are grouped into **Root Cause** (critical issues that explain the main performance problem) and **Secondary Issues** (additional optimizations).

### Authentication
- Email and password signup and login
- Google OAuth sign-in
- Protected routes — only authenticated users can analyze and view history
- Unauthenticated visitors see the analyzer input but get a login prompt when they click Analyze

### History
- Every analysis is automatically saved to your account
- Paginated history page (10 entries per page)
- Each history entry shows issue count, severity badge, and plan preview
- Click any entry to view the full tree and suggestions again
- Delete individual history entries with confirmation

### Shared Reports
- Generate a public shareable link for any analysis
- Links are active for 7 days then automatically expire
- View count tracked on each shared report
- Links can be manually deactivated
- Expired or inactive links can be regenerated with a new 7-day timer

### Feedback
- Thumbs up or down on each suggestion
- Optional comment to explain your experience
- Helps track which suggestions are actionable in real scenarios

### CLI Tool (Downloadable)
- A separate Node.js CLI package in the `cli/` folder
- Reads execution plan from terminal or file input
- Runs the same core parser and rules engine locally
- No server or internet connection required
- Useful for CI/CD pipeline integration

### Database Type Selector
- Dropdown to select database type before analyzing
- PostgreSQL is supported and set as default
- MySQL, SQL Server, Oracle, SQLite shown as coming soon
- Warning message shown when unsupported database selected
- Analyze button disabled for unsupported types

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (email + Google OAuth) |
| ORM / BaaS | Supabase JS client |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Deployment | Vercel (frontend + backend) |

---

## Project Structure

```
sql-query-analyzer/
│
├── backend/
│   ├── controllers/
│   │   ├── queryController.js       ← analyze + history CRUD
│   │   ├── feedbackController.js    ← feedback CRUD
│   │   └── sharedReportController.js← shared report logic
│   ├── core/
│   │   ├── parser.js                ← EXPLAIN ANALYZE parser
│   │   └── rules.js                 ← rule-based detection engine
│   ├── db/
│   │   └── supabaseClient.js        ← supabase client + token client
│   ├── middleware/
│   │   └── authMiddleware.js        ← JWT verification
│   ├── routes/
│   │   ├── queryRoutes.js
│   │   ├── feedbackRoutes.js
│   │   └── sharedReportRoutes.js
│   ├── vercel.json
│   ├── index.js                     ← Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── analyzerApi.js       ← POST /analyze
│   │   │   └── historyApi.js        ← history API calls
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── analyzer/
│   │   │       ├── QueryInput.jsx   ← plan input + db selector
│   │   │       ├── TreeNode.jsx     ← single recursive node card
│   │   │       ├── PlanTree.jsx     ← full tree wrapper
│   │   │       └── SuggestionPanel.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      ← global auth state
│   │   ├── hooks/
│   │   │   ├── useAnalyzer.js       ← analyze state + API call
│   │   │   └── useHistory.js        ← history state + pagination
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── History.jsx
│   │   │   └── HistoryDetail.jsx
│   │   └── utils/
│   │       ├── supabaseClient.js    ← frontend supabase instance
│   │       └── validateQueryPlan.js ← client-side input validation
│   ├── vercel.json
│   └── package.json
│
├── cli/
│   ├── index.js                     ← CLI entry point
│   └── package.json
│
└── README.md
```

---

## How It Works

### 1. User pastes execution plan

The frontend validates the input before sending it to the backend. Validation checks:
- Input is not empty or too short
- Contains at least one valid PostgreSQL node type
- Contains cost and row patterns from `EXPLAIN ANALYZE`
- Does not look like a raw SQL query
- Does not exceed maximum length

### 2. Parser extracts node data

`backend/core/parser.js` processes the raw text line by line. For each node it extracts:

**From the plan text (as written):**
- Operation type, table name, filter condition
- Estimated startup cost and total cost
- Estimated rows and width
- Actual startup time and end time per loop
- Actual rows per loop
- Loop count

**Calculated by the parser:**
- `totalActualTime` = `actualEndTime × loops`
- `totalStartupTime` = `actualStartTime × loops`
- `totalActualRows` = `actualRows × loops`
- `totalEstRows` = `estRows × loops`
- `timingPercent` = `(totalActualTime / executionTime) × 100`
- `rowEstimationRatio` = `totalActualRows / totalEstRows`

### 3. Rules engine generates suggestions

`backend/core/rules.js` iterates through all parsed nodes and applies each detection rule. Suggestions are grouped into `rootCause` and `secondary` arrays. If a nested loop with an inner sequential scan is found, a consolidated root cause with a recommended `CREATE INDEX` SQL statement is generated.

### 4. Result saved and returned

The analysis result (tree + suggestions) is saved to the `history` table in Supabase. The same result is returned immediately to the frontend so the user sees results without a second network call.

### 5. Frontend displays results

The tree is rendered recursively using `TreeNode.jsx`. Each node renders its own children, creating the indented tree structure. Users can expand or collapse each node and toggle a detail panel for full per-loop statistics.

---

## Core Modules

### `parser.js`

The parser is completely framework-agnostic. It takes a plain string and returns:

```js
{
    root,              // root node object with nested children
    nodes,             // flat array of all nodes
    totalExecutionTime // from "Execution Time: X ms" line
}
```

Each node object contains all extracted and calculated fields. The tree is built using an indent-based stack algorithm — nodes with greater indentation become children of the most recent node with lesser indentation.

### `rules.js`

The rules engine takes the flat `nodes` array (not the tree) and returns:

```js
// issues found
{
    rootCause: [ { issue, explanation, suggestion, recommended_sql, raw } ],
    secondary: [ { issue, explanation, suggestion, raw } ]
}

// no issues
{
    success: true,
    message: "Query plan looks good!"
}
```

The `recommended_sql` field on root cause suggestions contains a ready-to-run `CREATE INDEX` statement when a filter column can be identified from the plan.

### `supabaseClient.js`

Two exports:

```js
// base client — used for auth verification and public routes
export const supabase = createClient(URL, ANON_KEY)

// per-request client — passes user JWT in Authorization header
// enables Supabase RLS to identify the user for each request
export const supabaseWithToken = (token) =>
    createClient(URL, ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    })
```

The per-request client pattern is used because Supabase Row Level Security (RLS) requires the user's JWT to be present in the request header to correctly apply `auth.uid() = user_id` policies.

### `authMiddleware.js`

Runs before every protected route. Extracts the Bearer token from the `Authorization` header, creates a Supabase client with that token, and calls `getUser()` to verify it. Attaches the verified user object to `req.user` and the token to `req.token` for use in controllers.

---

## API Reference

All protected routes require `Authorization: Bearer <token>` header.

### Query Analysis

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/analyze` | Required | Analyze a query plan |
| `GET` | `/api/history` | Required | Get paginated history |
| `GET` | `/api/history/:id` | Required | Get single history entry |
| `DELETE` | `/api/history/:id` | Required | Delete history entry |

**POST `/api/analyze` body:**
```json
{
    "queryPlan": "Seq Scan on users (cost=0.00..35.50 rows=1550 width=36)..."
}
```

**GET `/api/history` query params:**
```
?page=1&limit=10
```

### Feedback

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/feedback` | Required | Submit feedback on a suggestion |
| `GET` | `/api/feedback/:history_id` | Required | Get feedback for a history entry |
| `PATCH` | `/api/feedback/:id` | Required | Update feedback |
| `DELETE` | `/api/feedback/:id` | Required | Delete feedback |

### Shared Reports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/shared-reports` | Required | Create shared report |
| `GET` | `/api/shared-reports/my` | Required | Get all your shared reports |
| `PATCH` | `/api/shared-reports/:id/deactivate` | Required | Deactivate a link |
| `PATCH` | `/api/shared-reports/:id/regenerate` | Required | Regenerate with new 7-day timer |
| `GET` | `/api/shared-reports/:slug` | Public | View a shared report |

---

## Database Schema

```sql
-- handled automatically by Supabase Auth
auth.users

-- query analysis history
history (
    id          uuid primary key,
    user_id     uuid references auth.users,
    query_plan  text,         -- raw EXPLAIN ANALYZE text
    suggestions jsonb,        -- grouped suggestions object
    tree        jsonb,        -- parsed tree structure
    created_at  timestamptz
)

-- suggestion feedback
feedback (
    id               uuid primary key,
    user_id          uuid references auth.users,
    history_id       uuid references history,
    suggestion_issue text,
    is_helpful       boolean,
    comment          text,
    created_at       timestamptz
)

-- shared public report links
shared_reports (
    id          uuid primary key,
    user_id     uuid references auth.users,
    history_id  uuid references history,
    slug        text unique,   -- random 12-char hex string
    is_active   boolean,
    expires_at  timestamptz,   -- 7 days from creation
    view_count  integer,
    created_at  timestamptz
)
```

All tables have Row Level Security enabled. Each user can only read, insert, update, and delete their own rows.

---

## Authentication

Authentication is handled entirely by Supabase Auth. No custom auth endpoints are needed on the backend.

**Flow:**

```
Frontend (Supabase JS) → Supabase Auth → JWT issued
       ↓
Frontend sends JWT in Authorization header with every API request
       ↓
Backend authMiddleware verifies JWT with Supabase
       ↓
Verified user attached to req.user
       ↓
Controllers use supabaseWithToken(req.token) for DB operations
       ↓
Supabase RLS automatically filters rows by auth.uid() = user_id
```

**Supported methods:**
- Email and password
- Google OAuth

---

## Security

| Protection | Implementation |
|---|---|
| Route protection | `authMiddleware` verifies JWT on every protected route |
| Data isolation | Supabase RLS ensures users only access their own data |
| Ownership checks | Controllers verify `user_id` match before returning data |
| Input validation | Client-side and server-side validation on query plan input |
| CORS | Backend only accepts requests from the configured frontend URL |
| Token pattern | Per-request Supabase client — no service role key used |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Google Cloud project (for OAuth)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/sql-query-analyzer.git
cd sql-query-analyzer
```

### 2. Set up the database

Run these SQL statements in your Supabase SQL Editor:

```sql
create table history (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    query_plan text not null,
    suggestions jsonb not null,
    tree jsonb,
    created_at timestamptz default now()
);

create table feedback (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    history_id uuid references history(id) on delete cascade,
    suggestion_issue text not null,
    is_helpful boolean not null,
    comment text,
    created_at timestamptz default now()
);

create table shared_reports (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    history_id uuid references history(id) on delete cascade,
    slug text unique not null,
    is_active boolean default true,
    expires_at timestamptz not null,
    view_count integer default 0,
    created_at timestamptz default now()
);

alter table history enable row level security;
alter table feedback enable row level security;
alter table shared_reports enable row level security;

create policy "Users manage their own history"
on history as permissive for all to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own feedback"
on feedback as permissive for all to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own shared reports"
on shared_reports as permissive for all to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Public can view active reports"
on shared_reports as permissive for select to anon
using (is_active = true and expires_at > now());
```

### 3. Install and run backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

```bash
node index.js
```

### 4. Install and run frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Open `http://localhost:5173`

---

## Environment Variables

### Backend

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `FRONTEND_URL` | Frontend origin for CORS (no trailing slash) |
| `PORT` | Port for local development |
| `NODE_ENV` | `development` or `production` |

### Frontend

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `VITE_API_URL` | Backend API base URL e.g. `https://your-backend.vercel.app/api` |

---

## Deployment

Both backend and frontend are deployed on Vercel from the same GitHub repository using different root directories.

| Project | Root Directory | Framework |
|---|---|---|
| Backend | `backend` | Other (Node.js) |
| Frontend | `frontend` | Vite |

The backend `vercel.json` routes all traffic through `index.js`. The frontend `vercel.json` rewrites all routes to `index.html` so React Router handles client-side navigation correctly.

---

## Authors

- Rudraksh Sharma
- Samarth Bhardwaj
- Krishna Anand
- Rishit Verma

Master of Computer Applications — BVICAM, New Delhi