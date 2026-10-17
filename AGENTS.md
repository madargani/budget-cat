# Budget Cat — Repo Organization Conventions

This document is the single source of truth for where code goes and how it is written. Every agent and contributor should read it before making changes. When in doubt, ask rather than guess.

## 1. Where code goes (folder map)

| Folder | Purpose | Rules |
|--------|---------|-------|
| `src/app/` | Next.js App Router only — routes, layouts, pages, route handlers | Keep route files thin. Fetch data in the page/layout, then pass it down to components. No business logic here. |
| `src/components/ui/` | Shared, generic UI primitives (shadcn base: button, input, card, dialog…) | No feature logic, no data fetching, no imports from `src/components/home/` etc. |
| `src/components/<feature>/` | Feature-specific UI (e.g. `home/`, `transactions/`, `auth/`, `bank/`, `layout/`) | One component per file; filename matches the exported component name (`AddBudgetItem` → `add-budget-item.tsx`). |
| `src/hooks/` | Custom React hooks — data fetching and UI state logic | Hooks own TanStack Query (tRPC) usage and form logic. Components call hooks; they do not call `api.xxx.useQuery` directly unless trivial. |
| `src/lib/` | Pure utilities, formatters, date helpers | No React, no Prisma, no tRPC. |
| `src/server/db.ts` | Prisma client singleton | Imported only from server code (`"use server"` or tRPC routers/services). |
| `src/server/services/` | Business logic — pure functions that take primitives/IDs and return data | Used by tRPC routers. No React, no HTTP, no TanStack Query. |
| `src/server/actions/` | Server Actions (`"use server"`) | Imported by client components to mutate/redirect. Validate inputs with Zod schemas. |
| `src/server/plaid/` | Plaid client + sync/integration helpers | Server-only. No React, no tRPC. |
| `src/server/better-auth/` | Auth server config + `getSession` helper | Server-only, except `client.ts`. `getSession` is called from server components/layouts. |
| `src/server/api/schemas/` | Zod validation schemas | One file per domain (`budget.ts`, `transactions.ts`, `items.ts`). Export types via `z.infer<typeof schema>`. |
| `src/server/api/routers/` | tRPC routers | One file per domain. Routers call services; they do not contain inline business logic. |
| `src/server/api/trpc.ts` | tRPC init (context, procedures, error formatter) | Rarely edited. Add new procedures/middleware here only when a new *kind* of procedure is needed. |
| `src/server/api/root.ts` | Root router assembly | Manually register every new router here. |
| `src/trpc/` | tRPC React client + TanStack Query client setup | `react.tsx` creates the client/provider; `query-client.ts` configures `QueryClient`. |

**Not allowed:** `index.ts` barrel files in `src/components/`. Import components by their explicit file path so it is obvious where code lives.

## 2. File focus rules

- **Short and focused.** Aim for under ~200 lines per file. When a file exceeds this, split it:
  - A component that renders a distinct sub-UI (dialog, list item, form section) becomes its own file in the same feature folder.
  - A hook that manages two unrelated concerns becomes two hooks.
  - Exception: shadcn-generated primitives in `src/components/ui/` may exceed the limit; keep them intact so they survive `shadcn add`. Add a header comment noting the exception (see §8).
- **Components are primarily UI.** Component files should contain layout, styling, and event wiring only. Data fetching, mutations, optimistic updates, and form validation live in hooks or services.
- **One component per file.** Feature components export a single component and the filename matches it (`AddBudgetItem` → `add-budget-item.tsx`), nothing else exported from that file. Pure utility modules under `src/lib/` and hook modules under `src/hooks/` may export several closely related helpers (e.g. `format.ts` exports the formatters); shadcn `ui/` primitives export their constituent parts (e.g. `Dialog`, `DialogContent`).

## 3. Data & validation rules

- **Zod for all validation.**
  - tRPC inputs: `.input(zodSchema)` in the router.
  - React forms: `react-hook-form` + `@hookform/resolvers` zod resolver.
  - Never do manual validation (`.trim()`, truthiness checks, length checks) inside components or procedures.
- **Types come from Zod or Prisma.** Use `z.infer<typeof schema>` and `Prisma.$InferResult<...>`. Do not hand-write duplicate types.
- **TanStack Query via tRPC for server state.** Use `api.xxx.useQuery()` and `api.xxx.useMutation()` from `~/trpc/react`. Do not use `useState`/`useEffect` to hold server-fetched data.
- **Client state only in hooks.** Local UI state (open/closed, draft form values) may live in components, but prefer lifting it into a hook when the logic is non-trivial.

## 4. Client / server boundary

- Put `"use client"` at the top of any file that uses browser APIs, hooks, or interactivity.
- **Client components never import server internals from `src/server/`**: the Prisma client (`db`), services, tRPC server code, Plaid helpers, or anything marked `server-only`. Data reaches them via page props, Server Actions, or tRPC.
- Two imports from `src/server/` are allowed in client code:
  1. **Zod schemas** (and their inferred types) from `src/server/api/schemas/*`. They are the shared validation contract between forms and the API — client forms pass them to `zodResolver` so both sides validate identically. This is only safe because those files stay **pure Zod** (their sole import is `zod`); if a schema file ever imports anything else, it becomes server-only and must not be imported by client code.
  2. **Server Actions** from `src/server/actions/*`. These files start with `"use server"`, so importing their exported functions turns calls into RPC — no server internals leak to the client bundle. This is how `login-form.tsx` / `signup-form.tsx` call `signIn` / `signUp`.
- To keep these imports separate from server internals, put shared Zod schemas and Server Actions at those exact paths; do not re-export `db`/services through them.
- **Server components never use React hooks or browser globals.**
- Pick one data pattern per feature: tRPC procedure or Server Action. Do not mix both for the same resource without documenting why.

## 5. Naming

- Components: PascalCase (`HomeScreen`, `TransactionRow`).
- Hooks: camelCase with `use` prefix (`useBudget`, `useAuthSession`).
- Files: kebab-case matching the export (`home-screen.tsx`, `use-budget.ts`).
- Zod schemas: camelCase exported const (`addCategoryGroupInput`), with `z.infer` type alias in PascalCase (`AddCategoryGroupInput`).
- Services/routers: camelCase filenames, PascalCase exported router consts (`transactionsRouter`).

## 6. Adding a new feature (checklist)

1. Create `src/components/<feature>/` for UI.
2. Add Zod schema(s) to `src/server/api/schemas/<feature>.ts` (or create the file).
3. Add business logic to `src/server/services/<feature>.ts` if it does CRUD or external calls.
4. Add a tRPC router in `src/server/api/routers/<feature>.ts` using `.input(zodSchema)`.
5. Register the router in `src/server/api/root.ts`.
6. Consume data in a hook under `src/hooks/` (TanStack Query via tRPC) or a Server Action under `src/server/actions/`, then render from a page in `src/app/(app)/<feature>/page.tsx`. Pick one pattern per feature (§4).
7. If a component exceeds ~200 lines, split it into sub-components in the same folder.

## 7. Conventions that already exist in this repo (keep following them)

- tRPC routers with `protectedProcedure`/`publicProcedure` from `~/server/api/trpc`.
- SuperJSON transformer (already configured in `trpc.ts` and `trpc/react.tsx`).
- `cn()` from `~/lib/utils` for class merging (`~/lib/utils` re-exports the `cn` package; import from `~/lib/utils`, not `cn`).
- `createCallerFactory` for server-side tRPC calls.
- Protected routes redirect unauthenticated users (see `src/app/(app)/page.tsx`).

## 8. When you break a rule

If a situation genuinely requires an exception, add a short comment above the code explaining why, and update this AGENTS.md if the exception becomes a pattern.
