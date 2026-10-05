# Budget Cat 🐱

Budget Cat is a zero-based budgeting app heavily inspired by [YNAB](https://www.ynab.com/). Every dollar gets a job — assign your income to categories, track transactions, and stay on top of your spending.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [tRPC](https://trpc.io)
- [Prisma](https://prisma.io) with SQLite
- [Better Auth](https://www.better-auth.com)
- [Plaid](https://plaid.com) for bank connections
- [Tailwind CSS](https://tailwindcss.com)

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm

### Setup

1. Clone the project:

   ```bash
   git clone <repo-url>
   cd budget-cat
   ```

2. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. Fill in the required environment variables in `.env`:

   | Variable           | Description                                  |
   | ------------------ | -------------------------------------------- |
   | `BETTER_AUTH_SECRET` | Secret used by Better Auth for session encryption |
   | `PLAID_CLIENT_ID`    | Your Plaid client ID                         |
   | `PLAID_SECRET`       | Your Plaid secret                            |
   | `DATABASE_URL`       | Database connection URL (defaults to SQLite) |

4. Install dependencies:

   ```bash
   npm install
   ```

5. Set up the database:

   ```bash
   npm run db:generate
   ```

6. Start the dev server:

   ```bash
   npm run dev
   ```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Useful Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the development server         |
| `npm run build`     | Build for production                 |
| `npm run start`     | Start the production server          |
| `npm run db:generate` | Run Prisma migrations (dev)        |
| `npm run db:push`   | Push schema changes without migrations |
| `npm run db:studio` | Open Prisma Studio                   |
| `npm run lint`      | Lint the codebase                    |
| `npm run typecheck` | Run TypeScript type checking         |
| `npm run format:write` | Format code with Prettier        |
