# OKR Tool - Full Stack Next.js + Convex Application

This project is a modern full-stack application for managing Objectives and Key Results (OKRs), built with:

- **Frontend**: Next.js (App Router), React, Tailwind CSS, shadcn/ui
- **Backend**: Convex (Real-time database, backend functions)
- **Testing**: Vitest, React Testing Library
- **Language**: TypeScript

## Architecture

The project follows a modular structure inspired by Domain-Driven Design (DDD) principles adapted for the Convex/Next.js ecosystem.

- `convex/`: Contains the backend logic (Domain & Application layers).
  - `schema.ts`: Defines the data model (Entities).
  - `objectives.ts`, `keyResults.ts`: Domain services and application logic (Mutations/Queries).
- `src/app/`: Presentation layer (Next.js App Router).
- `src/components/`: Reusable UI components.
  - `objectives/`, `key-results/`: Feature-specific components (Bounded Contexts).
  - `ui/`: Generic UI components (shadcn/ui).

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup Instructions

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Initialize Convex**

    You need to initialize the Convex backend.

    ```bash
    npx convex dev
    ```

    This command will:
    - prompt you to log in to Convex.
    - create a new project in your Convex dashboard.
    - generate necessary environment variables in `.env.local`.
    - generate TypeScript types in `convex/_generated/`.

3.  **Run Development Server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000).

## Testing

Run unit and component tests:

```bash
npm test
# or
npx vitest run
```

## Deployment

The project is ready for deployment on Vercel.

1.  Push to GitHub.
2.  Import project in Vercel.
3.  Add environment variables (`NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`).
4.  Deploy.

For the Convex backend, it deploys automatically when you run `npx convex deploy` or configure it in Vercel build settings.
