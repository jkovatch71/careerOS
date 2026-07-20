# Career OS

Career OS is an executive career management platform: a focused operating system for companies, opportunities, relationships, outreach, interviews, and career decisions.

## Stack

- Next.js 16 with App Router and TypeScript
- React 19
- Tailwind CSS 4
- shadcn/ui conventions and source-owned UI components
- Supabase Auth, PostgreSQL, and Row Level Security
- Supabase SSR for cookie-based sessions
- Zod for boundary validation

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

3. Add the existing Supabase project URL and publishable key to `.env.local`.

4. Start development:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

- `src/app/(auth)` contains public authentication screens.
- `src/app/(app)` contains the authenticated product surface.
- `src/lib/supabase` owns browser, server, and proxy Supabase clients.
- `src/components/ui` contains source-owned UI primitives.
- `src/components` contains application-level shared components.
- `src/proxy.ts` refreshes auth sessions; the protected layout independently validates the user.

Authorization is enforced by Supabase Row Level Security. Route protection improves user experience but is not treated as the application security boundary.

## Quality checks

```bash
npm run lint
npm run build
```
