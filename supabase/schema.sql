create schema if not exists private;

create type public.user_role as enum ('user', 'admin');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  restaurant_name text not null,
  slug text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

create table public.menus (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  title text not null,
  pdf_url text not null,
  thumbnail_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index restaurants_owner_id_idx on public.restaurants(owner_id);
create index restaurants_slug_idx on public.restaurants(slug);
create index menus_restaurant_id_idx on public.menus(restaurant_id);
create index menus_active_created_at_idx on public.menus(is_active, created_at desc);

create or replace function private.slugify(input text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, 'business')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function private.unique_restaurant_slug(input text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_slug text;
  candidate text;
  suffix integer := 0;
begin
  base_slug := private.slugify(input);
  if base_slug = '' then
    base_slug := 'business';
  end if;

  candidate := base_slug;

  while exists (select 1 from public.restaurants where slug = candidate) loop
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix::text;
  end loop;

  return candidate;
end;
$$;

create or replace function private.current_user_role()
returns public.user_role
language sql
security definer
set search_path = ''
stable
as $$
  select role from public.users where id = (select auth.uid()) limit 1;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  business_name text;
  business_slug text;
begin
  business_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'business_name', '')), '');
  business_slug := private.unique_restaurant_slug(coalesce(business_name, new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));

  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    new.email,
    'user'
  )
  on conflict (id) do update
  set email = excluded.email,
      name = excluded.name;

  if business_name is not null then
    insert into public.restaurants (owner_id, restaurant_name, slug)
    values (new.id, business_name, business_slug)
    on conflict (slug) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.users enable row level security;
alter table public.restaurants enable row level security;
alter table public.menus enable row level security;

create policy "Users can read their own profile"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id and role = 'user');

create policy "Admins can read all user profiles"
  on public.users for select
  to authenticated
  using (private.current_user_role() = 'admin');

create policy "Public can read restaurants"
  on public.restaurants for select
  to anon, authenticated
  using (true);

create policy "Admins can read all restaurants"
  on public.restaurants for select
  to authenticated
  using (private.current_user_role() = 'admin');

create policy "Restaurant owners can insert restaurants"
  on public.restaurants for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Restaurant owners can update restaurants"
  on public.restaurants for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Restaurant owners can delete restaurants"
  on public.restaurants for delete
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "Public can read active menus"
  on public.menus for select
  to anon, authenticated
  using (is_active = true);

create policy "Restaurant owners can read menus"
  on public.menus for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = (select auth.uid())
    )
  );

create policy "Admins can read all menus"
  on public.menus for select
  to authenticated
  using (private.current_user_role() = 'admin');

create policy "Restaurant owners can insert menus"
  on public.menus for insert
  to authenticated
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = (select auth.uid())
    )
  );

create policy "Restaurant owners can update menus"
  on public.menus for update
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = (select auth.uid())
    )
  );

create policy "Restaurant owners can delete menus"
  on public.menus for delete
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = (select auth.uid())
    )
  );

grant usage on schema public to anon, authenticated;
grant select on public.restaurants to anon, authenticated;
grant select on public.menus to anon, authenticated;
grant select, update on public.users to authenticated;
grant insert, update, delete on public.restaurants to authenticated;
grant insert, update, delete on public.menus to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menus', 'menus', true, 15728640, array['application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Authenticated users can upload menu PDFs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'menus'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners can update their menu PDFs"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'menus'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'menus'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners can delete their menu PDFs"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'menus'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
