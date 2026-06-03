# Codebase Overview

BookMenu is a Next.js 16 App Router application for turning restaurant PDF menus into public mobile menu pages with QR codes and a flipbook-style viewer. The current implementation uses Supabase for auth and database records, with Cloudflare R2 storing uploaded files.

## Stack

- Next.js `16.2.6`
- React `19.2.4`
- Tailwind CSS `4`
- Supabase SSR client: `@supabase/ssr`
- Supabase JS: `@supabase/supabase-js`
- PDF rendering: `react-pdf`
- Flipbook interaction: `react-pageflip`
- QR generation: `qrcode`
- Icons: `lucide-react`
- Validation: `zod`

## Environment

Local environment variables live in `.env.local`.

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_R2_BUCKET=menus
NEXT_PUBLIC_MAX_PDF_UPLOAD_MB=15
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=menus
CLOUDFLARE_R2_PUBLIC_URL=
```

Use `.env.example` as the template for new environments.

## Supabase Project

Connected project:

- Name: `book menu`
- Project ref: `uomfghnllxxaeurpxwsm`
- Region: `ap-south-1`
- Status: `ACTIVE_HEALTHY`

The schema is tracked in `supabase/schema.sql`.

Database objects:

- `public.users`
- `public.restaurants`
- `public.menus`
- `public.user_role` enum with `user` and `admin`
- `private.handle_new_user()` trigger function
- R2 bucket for uploaded PDFs and logos.
- Storage upload path format: `{auth.user.id}/{restaurant-slug}/{document-slug}-{timestamp}-{filename}.pdf`

Security:

- RLS is enabled on all public tables.
- Business users can manage only their own restaurants and menus.
- Public users can read restaurants and active menus.
- Supabase stores public R2 URLs in `menus.pdf_url` and `restaurants.logo_url`.
- Authenticated restaurant owners can read, insert, update, and delete their own menu rows.
- Admin users can read all users, restaurants, and menus for monitoring.

## Auth Flow

Login and signup are handled with server actions in `app/login/actions.ts`.

Signup:

1. Validates email and password with Zod.
2. Requires a business name.
3. Calls `supabase.auth.signUp` with metadata `business_name`, `name`, and role `user`.
4. Supabase trigger creates `public.users` and `public.restaurants` with a unique slug.
5. Sends verification email with redirect to `/auth/confirm?next=/dashboard`.
6. Redirects user back to `/login` with a check-email message.

Login:

- `admin` users are redirected to `/admin`.
- `user` accounts are redirected to `/dashboard`.
- If a `user` account has no restaurant yet, it is redirected to `/onboarding` to enter a business name and create the slug.

Email verification:

- Implemented in `app/auth/confirm/route.ts`.
- Supports Supabase `token_hash` verification via `verifyOtp`.
- Supports Supabase `code` verification via `exchangeCodeForSession`.
- Redirects verified users to `/dashboard`.

Logout:

- Implemented in `app/auth/logout/route.ts`.
- Calls `supabase.auth.signOut`.
- Redirects to `/login`.

Session refresh:

- Root `proxy.ts` calls `lib/supabase/proxy.ts`.
- Uses Supabase SSR cookies and `auth.getUser()` to refresh sessions.

## Dashboard

Route: `/dashboard`

Files:

- `app/dashboard/page.tsx`
- `components/dashboard/dashboard-app.tsx`

Current behavior:

- Server page checks Supabase auth with `auth.getUser()`.
- Unauthenticated users are redirected to `/login`.
- Dashboard lists menus from `public.restaurants` and `public.menus`.
- Uploads call `app/dashboard/actions.ts`.
- Server action validates PDF type and size, uploads to Cloudflare R2, uses the current user's restaurant, and creates a menu row with the public file URL.
- If an older user has no restaurant profile yet, upload creates one from the business name field.
- Delete calls a server action that deletes the menu row and removes the R2 object when the public URL path can be resolved.
- Copy URL and QR download use the real restaurant slug from the database.

## Public Menu Viewer

Route: `/menu/[slug]`

Files:

- `app/menu/[slug]/page.tsx`
- `components/menu/flipbook-viewer.tsx`
- `components/menu/qr-card.tsx`

Current behavior:

- Loads restaurant and active menu data from Supabase by `restaurants.slug`.
- Renders PDF pages with `react-pdf`.
- Wraps pages in a flipbook using `react-pageflip`.
- Generates downloadable QR code client-side.

If the slug has no restaurant or no active menu, the route returns `404`.

## QR Page

Route: `/qr`

Current behavior:

- Requires an authenticated Supabase user.
- Reads active menus owned by the user from Supabase.
- Shows the newest active menu QR card and printable table card preview.

## Shared Libraries

`lib/config.ts`

- Central upload config.
- Reads PDF size limit and public R2 bucket name from env.

`lib/menu-types.ts`

- Shared `MenuRecord` type used by dashboard and public menu surfaces.

`lib/slug.ts`

- `slugify` for URL-safe restaurant slugs.
- `uniqueSlug` for upload-time slug generation.

`lib/supabase/client.ts`

- Browser Supabase client factory.

`lib/supabase/server.ts`

- Server Supabase client factory using Next cookies.

`lib/supabase/proxy.ts`

- Session refresh logic used by the root proxy.

## Verification Commands

```bash
npm run lint
npm run build
```

Last known status:

- `npm run lint`: passing
- `npm run build`: passing

## Recommended Next Steps

1. Add restaurant profile editing.
2. Add menu activation controls when a restaurant has multiple uploaded PDFs.
3. Add analytics after scan/event tracking is implemented.
