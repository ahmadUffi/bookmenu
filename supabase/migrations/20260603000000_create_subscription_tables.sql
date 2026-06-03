-- Create subscriptions table
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan text not null,
  price numeric not null,
  status text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

-- Create subscription_usages table
create table public.subscription_usages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  pdf_upload integer not null default 0,
  qr_scan integer not null default 0,
  created_at timestamptz not null default now()
);

-- Create indices for performance
create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscription_usages_user_id_idx on public.subscription_usages(user_id);

-- Enable Row Level Security (RLS)
alter table public.subscriptions enable row level security;
alter table public.subscription_usages enable row level security;

-- Define RLS Policies
create policy "Users can view their own subscription"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can view their own subscription usage"
  on public.subscription_usages for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Grant select privileges
grant select on public.subscriptions to authenticated;
grant select on public.subscription_usages to authenticated;
