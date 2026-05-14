# File Structure

Project root: `F:\bookmenu`

```text
bookmenu/
├── app/
│   ├── auth/
│   │   ├── confirm/
│   │   │   └── route.ts
│   │   └── logout/
│   │       └── route.ts
│   ├── dashboard/
│   │   ├── actions.ts
│   │   └── page.tsx
│   ├── login/
│   │   ├── actions.ts
│   │   └── page.tsx
│   ├── menu/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── qr/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── admin/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── dashboard/
│   │   └── dashboard-app.tsx
│   └── menu/
│       ├── flipbook-viewer.tsx
│       └── qr-card.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── proxy.ts
│   │   └── server.ts
│   ├── config.ts
│   ├── menu-types.ts
│   └── slug.ts
├── public/
├── supabase/
│   └── schema.sql
├── .env.example
├── .env.local
├── AGENTS.md
├── CODEBASE.md
├── FILE_STRUCTURE.md
├── next.config.ts
├── package.json
├── proxy.ts
└── tsconfig.json
```

## App Routes

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `app/page.tsx` | Product entry screen with dashboard and registration links. |
| `/login` | `app/login/page.tsx` | Login UI with role-based redirect. |
| `/dashboard` | `app/dashboard/page.tsx` | Protected restaurant dashboard shell. |
| `/onboarding` | `app/onboarding/page.tsx` | First-login business name and slug setup for users without a restaurant. |
| `/menu/[slug]` | `app/menu/[slug]/page.tsx` | Public mobile menu viewer. |
| `/qr` | `app/qr/page.tsx` | Protected QR print/download page using active database menus. |
| `/admin` | `app/admin/page.tsx` | Admin shell. |
| `/register` | `app/register/page.tsx` | Register route shell. |
| `/auth/confirm` | `app/auth/confirm/route.ts` | Email verification callback for Supabase Auth. |
| `/auth/logout` | `app/auth/logout/route.ts` | Supabase logout route. |

## Main Areas

- `app/` contains Next.js App Router pages, route handlers, layout, and global CSS.
- `components/dashboard/` contains dashboard client UI for real menu records.
- `components/menu/` contains public QR and flipbook viewer components.
- `lib/supabase/` contains browser, server, and proxy Supabase clients.
- `lib/` contains shared config, menu types, and slug helpers.
- `supabase/schema.sql` contains the applied MVP database/storage schema.
