# Copilot / Agent Instructions — Nexu Webshop

Quick orientation
- Stack: Next.js (app-router, React 19), TypeScript, TailwindCSS, Prisma (Postgres), NextAuth.js (v5), Resend (emails), Stripe (payments), and szamlazz.js (invoicing).
- Project layout highlights: server code lives in `app/` (server components can import `prisma`), serverless route handlers under `app/api/*`, libs in `lib/`, and client state in `context/`.

Essential dev workflows
- Run dev server: `npm run dev` (or `pnpm dev`, `yarn dev`).
- Build: `npm run build` → start: `npm run start`.
- Prisma: `npm run seed` runs `tsx prisma/seed.ts`. `prisma generate` runs automatically on `postinstall`.
- DB migrations stored under `prisma/migrations/` (use `prisma migrate` commands if needed).

Important environment variables (discoverable from code)
- `DATABASE_URL` — Postgres connection for Prisma (required).
- `AUTH_SECRET` — Required for NextAuth.js.
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — For Google OAuth.
- `RESEND_API_KEY` — sends transactional order emails; if missing, email sending is skipped (see `lib/email.ts`).
- `EMAIL_FROM` — optional; default `NEXU Store <onboarding@resend.dev>`.
- `ADMIN_EMAIL` — optional admin copy for order emails.
- `NEXT_PUBLIC_SITE_URL` (or `VERCEL_URL`) — used to build order tracking links (see `lib/site.ts`).
- `STRIPE_SECRET_KEY` — Required for Stripe payments.
- `SZAMLAZZ_TOKEN` — Required for Szamlazz.hu invoicing (see `lib/invoice.ts`).
- `CRON_SECRET` — Required for securing cron jobs (e.g. abandoned cart recovery).

Key patterns and conventions (actionable)
- Server vs client:
  - Files with `use client` are client components (e.g., `context/*`, `app/admin/add-product/page.tsx` form UI).
  - Server components may import `prisma` directly (e.g., `app/admin/products/page.tsx`) and can be `async`.
  - Use `server-only` imports for server-only helpers (`lib/email.ts`, `lib/site.ts`) and service layers (`lib/services/*`, `lib/invoice.ts`).
  - **Security**: Ensure sensitive server-side logic (e.g., invoicing, cron jobs) imports `server-only` to prevent client-side bundling.

- Prisma instance:
  - `lib/prisma.ts` uses a global singleton pattern to avoid multiple clients in dev; import `prisma` from there everywhere.

- Authentication & Authorization:
  - Implemented using **NextAuth.js v5**.
  - Configuration in `lib/auth.ts` and `lib/auth.config.ts`.
  - Supports **Google** and **Credentials** (email/password) providers.
  - **Email Verification**: Required for Credentials login. Uses `VerificationToken` model. Flow: Register -> Email -> Click Link (`/verify-email`) -> Login.
  - **Role-based access control**: Users have a `role` ('user' or 'admin').
  - **Middleware protection**: `middleware.ts` uses `authConfig` to protect `/admin` routes, requiring `role === 'admin'`.

- API design patterns:
  - Route handlers under `app/api/*` return `NextResponse.json({ success, ... })` and use status codes (400/409/500).
  - **Coupons**: `POST /api/coupons/validate` checks code validity, expiration, and usage limits.
  - **Reviews**: `POST /api/reviews` allows authenticated users to review products.
  - **Newsletter**: `POST /api/newsletter` for subscribing.
  - Checkout flow enforces stock decrement inside a transaction and returns `409` on out-of-stock (`OUT_OF_STOCK`). See `app/api/checkout/route.ts`.

- Product Variants:
  - Products can have multiple variants based on attributes (e.g., Color, Size).
  - Variants support individual stock, price, SKU, images, and descriptions.
  - Managed via `ProductVariant` model and `ProductOption` model in Prisma.
  - Admin UI (`add-product`, `edit-product`) supports dynamic variant generation and editing.

- Client state persistence:
  - Cart stored in localStorage under `nexu-cart` (see `context/CartContext.tsx`).
  - Favorites stored under `nexu-favorites` (`context/FavoritesContext.tsx`).
  - Compare list stored under `nexu-compare` (`context/CompareContext.tsx`).
  - Recently viewed stored under `nexu-recently-viewed` (`context/RecentlyViewedContext.tsx`).
  - Active coupon stored under `nexu-coupon` (managed by `CartContext`).


- Invoicing:
  - Implemented using `szamlazz.js` in `lib/invoice.ts`.
  - Automatically generates invoices for paid orders if `SZAMLAZZ_TOKEN` is present.

- Payments:
  - Implemented using Stripe.app/api/create-payment-intent/route.ts`, `lib/email.ts`, `lib/invoice
  - Payment Intent creation at `POST /api/create-payment-intent`.
- Email behavior:
  - `lib/email.ts` builds both HTML and text emails. It expects `RESEND_API_KEY` and uses `getSiteUrl()` for order links.

- Monetary and locale conventions:
  - Currency is HUF; formatting uses `toLocaleString('hu-HU')`. Email copy and UI text are Hungarian. Use these conventions when adding UI/strings or formatting prices.

Testing Strategy
- **Unit Tests**: Use `vitest` for utility functions (`lib/*`) and complex logic. Run with `npm run test:unit`.
- **E2E Tests**: Use `playwright` for critical user flows (Checkout, Login, Admin). Run with `npm run test:e2e`.
- **Mocking**: Mock external services (Stripe, Resend, Szamlazz.hu) in tests to avoid API calls.

Code Quality Standards
- **Type Safety**: No `any`. Use `zod` for runtime validation of API inputs and environment variables.
- **Performance**: Use `next/image` with defined sizes. Avoid large client-side bundles; use `server-only` for backend logic.
- **Error Handling**: Use `try/catch` in API routes and return structured error responses. Use `sonner` for client-side toasts.

Files to inspect first for common tasks
- Add/change products: `app/admin/add-product/page.tsx`, `app/admin/edit-product/[id]/EditProductForm.tsx`, `app/api/products/route.ts`.
- Checkout/order flow: `app/api/checkout/route.ts`, `lib/email.ts`, `lib/shipping.ts`.
- Admin UI: `app/admin/*` pages.
- Auth logic: `lib/auth.ts`, `lib/auth.config.ts`, `middleware.ts`, `app/verify-email/page.tsx`.
- Coupons: `app/api/coupons/*`, `context/CartContext.tsx`, `prisma/schema.prisma`.

Bugs & gotchas to watch for (observed from code)
- Email delivery requires `RESEND_API_KEY`; missing key silently skips sending (not fatal).
- Stock updates are guarded using `updateMany` checks inside a transaction.
- Ensure `AUTH_SECRET` is set in production for NextAuth.
- **Login Block**: Users cannot log in with Credentials until they verify their email.

Examples of concrete tasks (how an agent should act)
- To add a new product field: update Prisma schema → `prisma migrate dev` → update API parsing → update Admin UI.
- To test coupons: Create a coupon in Admin UI (or seed), then try to apply it in Checkout.

When in doubt, inspect these files first:
- `lib/prisma.ts`, `app/api/checkout/route.ts`, `lib/auth.ts`, `prisma/schema.prisma`.

## Production Readiness Roadmap
See `PRODUCTION_PLAN.md` for the detailed checklist.
1. **Security**: Verify Stripe payments server-side, restrict image domains, implement rate limiting.
2. **Reliability**: Implement Stripe Webhooks, robust address parsing.
3. **UX**: Polish loading states, error boundaries, and mobile responsiveness.
4. **Performance**: Optimize Core Web Vitals, dynamic metadata, and logging.