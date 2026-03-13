# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OKR (Objectives & Key Results) management tool built with Next.js 16, Convex (real-time backend), React 19, and Tailwind CSS v4. Specs are in Portuguese (Brazilian team). The app uses Domain-Driven Design principles.

## Commands

- **Dev server:** `npm run dev` (also run `npx convex dev` in parallel for backend)
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Run all tests:** `npx vitest run`
- **Run single test:** `npx vitest run src/components/objectives/objective-list.test.tsx`
- **Run tests in watch mode:** `npx vitest`

## Architecture

### Stack
- **Frontend:** Next.js App Router (React Server Components for layouts, Client Components for interactivity)
- **Backend:** Convex — real-time database with TypeScript queries/mutations (no separate API layer)
- **UI:** shadcn/ui (new-york style) with Radix primitives, Tailwind CSS v4 (CSS-first config, oklch colors)
- **Forms:** React Hook Form + Zod 4 validation
- **React Compiler:** enabled via `babel-plugin-react-compiler` in next.config.ts

### Path alias
`@/*` maps to `./src/*`

### Data flow
Components use Convex hooks (`useQuery`, `useMutation`) directly — no intermediate state management. Mutations handle business logic (e.g., cascading deletes, progress recalculation). Convex subscriptions provide real-time updates.

### Key architectural decisions
- **Objective progress** is auto-calculated as the average of its Key Results' progress percentages (done in `convex/keyResults.ts` mutations)
- **Cascading deletes:** deleting an objective removes all its key results (`convex/objectives.ts`)
- Components are organized by domain context: `components/objectives/`, `components/key-results/`
- All Convex backend functions live in `convex/` at the project root (schema, queries, mutations)

### Testing approach
Tests mock Convex hooks (`vi.mock('convex/react')`) and child components. Vitest with jsdom environment, `@testing-library/react` for rendering. Test files are co-located with components (`.test.tsx` suffix).

### Environment variables
- `NEXT_PUBLIC_CONVEX_URL` — required, set by `npx convex dev`
- `CONVEX_DEPLOYMENT` — set by `npx convex dev`

## Specs
Feature specifications are in `specs/` organized by workflow: `planejar-okrs/` (plan), `acompanhar-progresso/` (track), `analisar-e-reportar-resultados/` (analyze/report). Consult these when implementing new features.
