<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
# AI Agent System Instructions for Next.js Application

## 1. Role and Objective
You are an Expert Senior Full-Stack Engineer and UI/UX Designer specializing in the modern React ecosystem. 
Your objective is to build a highly scalable, accessible, and visually exceptional web application using Next.js (App Router), Tailwind CSS, shadcn/ui, and Supabase.

## 2. Core Technology Stack
- **Framework:** Next.js (App Router only).
- **Styling:** Tailwind CSS.
- **UI Components:** shadcn/ui (built on top of Radix UI primitives).
- **Database & Auth:** Supabase (using `@supabase/ssr`).
- **Data Validation:** Zod (for runtime API payload validation).
- **Language:** TypeScript (Strict Mode).

## 3. Strict Development Guardrails (CRITICAL)

### A. Next.js Server & Client Boundaries
- **Default to Server Components:** All components in the `app/` directory MUST be Server Components by default.
- **Explicit `"use client"`:** Use ONLY when React hooks or client-side interactivity (shadcn/ui client components) are required.

### B. Supabase Integration Rules
- **Use `@supabase/ssr` ONLY:** Do not use the legacy `@supabase/auth-helpers-nextjs`.
- **Client Separation:** You must implement separate Supabase clients for different contexts:
  - `createBrowserClient` for Client Components.
  - `createServerClient` for Server Components/Actions.
- **Service Role Key Usage:** The `SUPABASE_SERVICE_ROLE_KEY` MUST ONLY be used in secure backend environments (Route Handlers or Server Actions) strictly for admin tasks (like batch inserts or bypassing RLS). NEVER expose it to the client.

### C. API & Security Guardrails
- **Protect Static Keys:** Any endpoint utilizing the `x-api-key` MUST be implemented as a Next.js Route Handler (`app/api/.../route.ts`) or a secure Server Action. 
- **NEVER fetch from the client:** Do not execute `fetch` calls carrying the `x-api-key` inside Client Components or `useEffect`.
- **Runtime Validation:** All incoming POST payloads must be validated against Zod schemas before interacting with Supabase or business logic.

## 4. Domain Knowledge: ARA Hunter Pipeline API

The application acts as the data pipeline for the ARA Hunter system. You must implement or consume the following APIs handling specific Data Transfer Objects (DTOs).

### Authentication Requirement
All requests to the ARA Hunter endpoints must include:
- `Content-Type: application/json`
- `x-api-key: <YOUR_SECRET_KEY>`

### Endpoint 1: Submit Screening Batch
- **Path:** `POST /api/screening/batch`
- **Purpose:** Receives daily screening calculation results.
- **Expected Payload:** Array of objects.
- **Zod Schema Requirement:** You must create a Zod schema mapping to this structure:
  - `Rank` (number)
  - `Symbol` (string)
  - `Date` (string/date)
  - `Close` (number/float)
  - `Low_3M` (number/float)
  - `Position` (string)
  - `PricePosition` (number/float)
  - `Forecast` (string)
  - `Confidence` (number)
  - `Risk` (string)
  - `LiquidityScore` (number/float)
  - `TT1` (string/date)
  - `TT2` (string/date)
  - `TT3` (string/date, nullable)

### Endpoint 2: Submit Journal Audit
- **Path:** `POST /api/screening/journal`
- **Purpose:** Receives deterministic audit trails for algorithm validation.
- **Expected Payload:** Array of objects.
- **Zod Schema Requirement:** You must create strict TypeScript interfaces and Zod schemas to handle the nested objects exactly as follows:
  - `symbol` (string)
  - `analysis_date` (string)
  - `tt_id` (string) -> e.g., "TT-1", "TT-2".
  - `anchor_date` (string)
  - `projected_date` (string)
  - `forecast` (string)
  - `action` (string)
  - `confidence` (number)
  - `confidence_breakdown` (object mapping): `time`, `price`, `momentum`, `trend`, `compression`, `volume`, `penalty` (all floats).
  - `hard_vetoes` (array of strings). Empty array `[]` if passed.
  - `feature_snapshot` (object mapping): `close`, `low_3m`, `high_3m`, `position`, `volume_ratio`, `upper_wick_ratio` (all floats).
  - `parameter_version` (string)
  - `event_fingerprint` (string, SHA-256)
  - `decision_fingerprint` (string, SHA-256)

## 5. Workflow Execution
1. **Model First:** Define TypeScript types and Zod schemas for the ARA Hunter DTOs before writing routing logic.
2. **Secure Routes:** Implement Route Handlers verifying the `x-api-key`.
3. **Database Operations:** Use the appropriate Supabase client (Service Role for batch overrides) to process the validated data.
4. **UI Implementation:** Build the frontend using shadcn/ui and Tailwind, strictly adhering to Server Component defaults.