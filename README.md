# HireDesk

[![CI](https://github.com/kratos0718/hiredesk-mern/actions/workflows/ci.yml/badge.svg)](https://github.com/kratos0718/hiredesk-mern/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![Tests](https://img.shields.io/badge/tests-58%20passing-success)

A job portal and applicant tracking system built on the MERN stack. Candidates search and apply
for roles and track every application through the hiring pipeline; recruiters post jobs, review
applicants, and move them through stages from a dashboard backed by MongoDB aggregations.

**Stack:** MongoDB · Express · React · Node.js — TypeScript end to end.

---

## Screenshots

| Job search with live filters | Job detail |
| --- | --- |
| ![Job search](docs/screenshots/02-jobs.png) | ![Job detail](docs/screenshots/04-job-detail.png) |

| Recruiter hiring dashboard | Applicant pipeline |
| --- | --- |
| ![Recruiter dashboard](docs/screenshots/07-recruiter-dashboard.png) | ![Applicants](docs/screenshots/09-applicants.png) |

| Candidate dashboard | Application tracking |
| --- | --- |
| ![Candidate dashboard](docs/screenshots/05-candidate-dashboard.png) | ![My applications](docs/screenshots/06-my-applications.png) |

<details>
<summary>More — landing page, job posting form, and mobile layout</summary>

| Landing page | Post a job |
| --- | --- |
| ![Home](docs/screenshots/01-home.png) | ![Post a job](docs/screenshots/10-post-job.png) |

| Manage postings | Mobile |
| --- | --- |
| ![My jobs](docs/screenshots/08-recruiter-jobs.png) | <img src="docs/screenshots/11-mobile-jobs.png" width="260" alt="Mobile job search"> |

</details>

---

## Contents

- [Screenshots](#screenshots)
- [What it does](#what-it-does)
- [Architecture](#architecture)
- [Running it locally](#running-it-locally)
- [Environment variables](#environment-variables)
- [Demo accounts](#demo-accounts)
- [API reference](#api-reference)
- [Data model](#data-model)
- [Engineering notes](#engineering-notes)
- [Testing](#testing)
- [Deployment](#deployment)

---

## What it does

### For candidates
- Search jobs by keyword with MongoDB full-text search, filter by location, type, work mode and
  salary, and sort by date, salary, or relevance
- Apply with a resume upload (PDF/DOC/DOCX) and an optional cover letter
- Track every application through its pipeline stages with a timestamped history trail
- Bookmark jobs to revisit later
- Dashboard showing application counts, response rate, and a funnel view

### For recruiters
- Post, edit, close, reopen, and delete job listings
- Review applicants per job with their profile, skills, and cover letter
- Download candidate resumes
- Advance candidates through `applied → shortlisted → interview → offered`, or reject at any stage
- Dashboard with pipeline breakdown, most-applied roles, and a 30-day application trend chart

### Roles
Three roles with distinct permissions: `candidate`, `recruiter`, and `admin` (admin can manage any
job). Every protected endpoint authorises on the server; the client-side route guard is only there
to save the user a wasted navigation.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React 18 SPA (Vite + TypeScript + Tailwind)                │
│                                                             │
│  React Router  ·  TanStack Query  ·  AuthContext            │
│  Access token in memory · refresh token in httpOnly cookie  │
└───────────────────────────┬─────────────────────────────────┘
                            │  REST over /api
                            │  (Vite dev proxy → :4000)
┌───────────────────────────▼─────────────────────────────────┐
│  Express 4 API (TypeScript, ESM)                            │
│                                                             │
│  helmet · cors · rate limiting · morgan                     │
│  routes → validate (Zod) → controllers → Mongoose models    │
│  centralised error handler · JWT auth + RBAC middleware     │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  MongoDB (Mongoose ODM)                                     │
│                                                             │
│  users · jobs · applications · savedjobs                    │
│  weighted text index · compound indexes · unique constraints│
└─────────────────────────────────────────────────────────────┘
```

### Repository layout

```
hiredesk/
├── server/
│   ├── src/
│   │   ├── config/        env validation (Zod), database connection
│   │   ├── models/        Mongoose schemas + indexes
│   │   ├── controllers/   request handlers
│   │   ├── routes/        route definitions and middleware wiring
│   │   ├── middleware/    auth, RBAC, validation, uploads, errors
│   │   ├── validators/    Zod request schemas
│   │   ├── utils/         ApiError, asyncHandler, JWT helpers
│   │   ├── app.ts         Express app factory
│   │   ├── index.ts       server bootstrap + graceful shutdown
│   │   └── seed.ts        demo data generator
│   └── tests/             Vitest + Supertest + in-memory MongoDB
├── client/
│   └── src/
│       ├── components/    Navbar, JobCard, route guard, UI primitives
│       ├── context/       AuthContext
│       ├── hooks/         useAuth, useDebounce
│       ├── pages/         one component per route
│       ├── lib/           API client, formatters
│       └── types.ts       shared response types
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## Running it locally

**Prerequisites:** Node.js 20+, and a MongoDB database. The fastest option is a free
[MongoDB Atlas](https://cloud.mongodb.com) cluster; alternatively use Docker (below).

```bash
# 1. Install dependencies for both workspaces
npm install

# 2. Configure the server
cp server/.env.example server/.env
#    Edit server/.env and set MONGO_URI plus the two JWT secrets.
#    Generate a secret with:
#    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Load demo data (10 jobs, 8 users, 16 applications)
npm run seed

# 4. Start the API (:4000) and the client (:5173) together
npm run dev
```

Open **http://localhost:5173**.

### With Docker

Starts MongoDB and the API together; run the client separately with `npm run dev:client`.

```bash
docker compose up --build
```

### Available scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | API and client together with live reload |
| `npm run dev:server` | API only, on port 4000 |
| `npm run dev:client` | Client only, on port 5173 |
| `npm test` | Server test suite (58 tests) |
| `npm run build` | Typecheck and compile both workspaces |
| `npm run lint` | Typecheck both workspaces |
| `npm run seed` | Reset the database and load demo data |

---

## Environment variables

All server configuration lives in `server/.env`. The server validates it with Zod at boot and
**exits immediately** with a readable message if anything is missing or malformed — a
half-configured server is worse than one that refuses to start.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MONGO_URI` | yes | — | MongoDB connection string |
| `JWT_ACCESS_SECRET` | yes | — | Signs 15-minute access tokens (min 16 chars) |
| `JWT_REFRESH_SECRET` | yes | — | Signs 7-day refresh tokens (min 16 chars) |
| `PORT` | no | `4000` | API port |
| `NODE_ENV` | no | `development` | `development` \| `test` \| `production` |
| `ACCESS_TOKEN_TTL` | no | `15m` | Access token lifetime |
| `REFRESH_TOKEN_TTL` | no | `7d` | Refresh token lifetime |
| `CLIENT_ORIGIN` | no | `http://localhost:5173` | Allowed CORS origin(s), comma-separated |
| `MAX_UPLOAD_MB` | no | `5` | Resume upload size cap |

---

## Demo accounts

After `npm run seed`, every account uses the password `Password123`:

| Role | Email |
| --- | --- |
| Candidate | `abhinav@example.com` |
| Recruiter | `priya@techcorp.in` |
| Admin | `admin@hiredesk.dev` |

The login page has one-click buttons that fill in the candidate and recruiter credentials.

---

## API reference

Base URL: `/api`. Authenticated routes expect `Authorization: Bearer <accessToken>`.

Every response follows the same envelope:

```jsonc
// success
{ "success": true, "data": { ... }, "pagination": { ... } }

// failure
{ "success": false, "message": "Validation failed",
  "details": [{ "field": "password", "message": "Password must be at least 8 characters" }] }
```

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | public | Create a candidate or recruiter account |
| `POST` | `/auth/login` | public | Log in; sets the refresh cookie |
| `POST` | `/auth/refresh` | cookie | Exchange the refresh cookie for a new access token |
| `POST` | `/auth/logout` | public | Clear the refresh cookie |
| `GET` | `/auth/me` | auth | Current user |
| `PATCH` | `/auth/me` | auth | Update profile |

### Jobs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/jobs` | public | List with search, filters, sorting, pagination |
| `GET` | `/jobs/:id` | public* | Single job (*adds `hasApplied`/`isSaved` when signed in) |
| `GET` | `/jobs/mine` | recruiter | The recruiter's own postings, including closed |
| `POST` | `/jobs` | recruiter | Create a job |
| `PATCH` | `/jobs/:id` | owner/admin | Update a job |
| `DELETE` | `/jobs/:id` | owner/admin | Delete a job and cascade its applications |

**Listing query parameters:** `q`, `location`, `type`, `workMode`, `skills`, `minSalary`,
`maxExperience`, `page`, `limit` (max 50), `sort` (`newest` \| `oldest` \| `salary` \| `relevance`).

### Applications

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/jobs/:id/apply` | candidate | Apply, `multipart/form-data` with `resume` |
| `GET` | `/jobs/:id/applications` | owner/admin | Applicants for one job |
| `GET` | `/applications/mine` | candidate | The candidate's applications |
| `PATCH` | `/applications/:id/status` | owner/admin | Advance or reject |
| `GET` | `/applications/:id/resume` | owner/applicant | Download the resume |
| `DELETE` | `/applications/:id` | applicant | Withdraw |

### Saved jobs & stats

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/jobs/:id/save` | auth | Bookmark (idempotent) |
| `DELETE` | `/jobs/:id/save` | auth | Remove bookmark |
| `GET` | `/jobs/saved` | auth | Bookmarked jobs |
| `GET` | `/stats/recruiter` | recruiter | Job totals, pipeline, top roles, 30-day trend |
| `GET` | `/stats/candidate` | candidate | Application totals, response rate, recent activity |
| `GET` | `/health` | public | Liveness + database status |

---

## Data model

```
User                          Job                            Application
────                          ───                            ───────────
name                          title                          job          → Job
email          (unique)       company                        applicant    → User
password       (bcrypt,       description                    status       (5-stage enum)
                select:false) location                       coverLetter
role           (enum)         workMode / type  (enums)       resumeUrl
headline                      skills           []            history      [{status, at, note}]
location                      salaryMin / salaryMax
skills         []             experienceMin
experienceYears               openings                       SavedJob
company                       status           (open/closed) ────────
resumeUrl                     postedBy         → User        user → User
                              applicantCount   (denormalised) job  → Job
```

### Indexes

| Collection | Index | Why |
| --- | --- | --- |
| `users` | `{ email: 1 }` unique | Login lookup; prevents duplicate accounts |
| `jobs` | text on `title`/`company`/`skills`/`description`, weighted 10/5/4/1 | Search ranks title matches above passing description mentions |
| `jobs` | `{ status: 1, createdAt: -1 }` | Matches the default listing query exactly |
| `jobs` | `{ postedBy: 1 }` | "My jobs" and recruiter stats |
| `applications` | `{ job: 1, applicant: 1 }` unique | Makes double-applying impossible at the database level |
| `applications` | `{ applicant: 1, createdAt: -1 }` | "My applications, newest first" |
| `savedjobs` | `{ user: 1, job: 1 }` unique | Saving twice is a no-op |

### Application state machine

```
             ┌──────────────┐
             │   applied    │
             └──────┬───────┘
          ┌─────────┴─────────┐
          ▼                   ▼
   ┌─────────────┐     ┌────────────┐
   │ shortlisted │────▶│  rejected  │ (terminal)
   └──────┬──────┘     └────────────┘
          ▼                   ▲
   ┌─────────────┐            │
   │  interview  │────────────┤
   └──────┬──────┘            │
          ▼                   │
   ┌─────────────┐            │
   │   offered   │ (terminal) │
   └─────────────┘────────────┘
```

Transitions are validated server-side. A recruiter can advance one stage or reject at any point,
but cannot walk a decision backwards or skip stages — so the history trail stays auditable and an
accidental un-rejection is impossible.

---

## Engineering notes

Things in here that were deliberate decisions rather than defaults:

**Tokens.** Access tokens are short-lived (15 min) and held in memory by the SPA — never in
`localStorage`, where any XSS payload could read them. The refresh token lives in an `httpOnly`,
`sameSite` cookie scoped to `/api/auth`, so JavaScript cannot touch it. On page load the client
silently trades the cookie for a new access token, which is what keeps you logged in across a
refresh. The API client also deduplicates concurrent refreshes: three simultaneous 401s trigger
one refresh, not three, because three rotations would invalidate each other.

**Duplicate applications.** Enforced by a unique compound index on `(job, applicant)`, not by an
`if` in the controller. A check-then-insert has a race window; the index does not. The controller
catches the duplicate-key error and translates it to a friendly 409.

**Duplicate-key detection is structural, not `instanceof`.** Mongoose bundles its own copy of the
MongoDB driver, so an error thrown through Mongoose is *not* an instance of the `MongoServerError`
class exported by a top-level `mongodb` import. Checking `err.code === 11000` works regardless of
which copy threw it. This was a real bug caught by the test suite.

**Denormalised applicant counts.** Every job card shows an applicant count, so `Job.applicantCount`
is maintained with atomic `$inc` on apply and withdraw rather than an aggregate join on the hot
listing path. `$inc` is applied server-side, so concurrent applicants cannot clobber each other
the way a read-modify-write would.

**Stats are computed in the database.** The dashboards use aggregation pipelines with `$lookup`,
`$group`, and `$dateToString`, filtered *inside* the lookup so unrelated documents never enter the
pipeline. Each returns a handful of rows regardless of collection size, instead of pulling
documents into Node and counting them there.

**Pagination and counting run concurrently.** The filtered `find()` and its `countDocuments()` are
independent and hit the same index, so they are issued with `Promise.all` — awaiting them in
sequence would double the latency of every page load.

**Uploads never trust the client.** Filenames are regenerated from a timestamp plus random bytes,
so path traversal and collisions are both impossible. MIME type is allowlisted, size is capped, and
`path.basename()` is applied again on download. An upload whose application fails to save is
deleted rather than left orphaned on disk.

**Errors are centralised.** One middleware maps `ZodError`, Mongoose `CastError` and
`ValidationError`, duplicate keys, and Multer failures to the right status code and a consistent
JSON shape. A malformed ObjectId in a URL returns 400, not a 500 stack trace. Stack traces are
included in development and stripped in production.

**Login does not leak which emails exist.** A wrong password and an unknown email return the same
401 and the same message, so the endpoint cannot be used to enumerate accounts. There is a test
asserting the two messages are byte-identical.

**Filters are URL state.** Job search filters live in the query string, so a filtered search is
shareable, survives a refresh, and works with the browser back button. The search box is debounced
so typing "react developer" fires one request instead of sixteen.

**Graceful shutdown.** `SIGTERM`/`SIGINT` stop accepting connections, drain in-flight requests, and
close the database connection before exit, with a 10-second hard timeout — so a deploy does not
drop live traffic.

---

## Testing

58 tests covering auth, RBAC, job CRUD, search and filtering, the application lifecycle, uploads,
and the aggregation endpoints.

```bash
npm test
```

Tests run against a **real MongoDB instance running in memory**
(`mongodb-memory-server`) rather than mocks, so they exercise actual index behaviour, unique
constraints, and aggregation semantics. Collections are wiped between tests while indexes are kept.

```
 Test Files  4 passed (4)
      Tests  58 passed (58)
```

What is covered beyond the happy paths:
- Password is stored as a bcrypt hash and never serialised to a response
- The refresh cookie is `HttpOnly`
- Self-registering as `admin` is rejected
- A recruiter cannot read, edit, or delete another recruiter's jobs or applicants
- A candidate cannot promote their own application
- Illegal state transitions (`applied → offered`, reopening a rejection) are refused
- A failed duplicate application does not inflate the applicant counter
- Deleting a job cascades to its applications
- A malformed ObjectId returns 400, not 500
- `limit=5000` is rejected rather than dumping the collection
- Response rate with zero applications returns 0 instead of dividing by zero

CI runs typechecking, the test suite, both production builds, and a dependency audit on every push
and pull request.

---

## Deployment

The client is a static bundle and the server is a standard Node process, so:

- **Client** → Vercel or Netlify. Build `npm run build --workspace client`, publish `client/dist`.
  Set the API base URL, or add a proxy rewrite for `/api`.
- **Server** → Render, Railway, or Fly.io. Build `npm run build --workspace server`, start with
  `npm start --workspace server`. Set every variable from the table above.
- **Database** → MongoDB Atlas. Allowlist the server's egress IP.

Two things to remember in production:
1. Set `NODE_ENV=production` — this switches the refresh cookie to `secure: true` and
   `sameSite: 'none'`, which is required when the client and API are on different domains.
2. Set `CLIENT_ORIGIN` to the deployed client URL, or CORS will reject the browser's requests.

Resumes are written to the local filesystem, which is ephemeral on most PaaS hosts. For a
long-lived deployment, swap the Multer disk storage in `server/src/middleware/upload.ts` for S3 or
Cloudinary — the interface is isolated to that one file.
