alter table public.menus
add column if not exists document_slug text;

with numbered as (
  select
    id,
    trim(both '-' from regexp_replace(lower(coalesce(title, 'document')), '[^a-z0-9]+', '-', 'g')) as base_slug,
    row_number() over (
      partition by restaurant_id, trim(both '-' from regexp_replace(lower(coalesce(title, 'document')), '[^a-z0-9]+', '-', 'g'))
      order by created_at, id
    ) as duplicate_number
  from public.menus
  where document_slug is null or document_slug = ''
)
update public.menus as menus
set document_slug =
  case
    when coalesce(numbered.base_slug, '') = '' then 'document-' || substring(menus.id::text, 1, 8)
    when numbered.duplicate_number = 1 then numbered.base_slug
    else numbered.base_slug || '-' || numbered.duplicate_number::text
  end
from numbered
where menus.id = numbered.id;

alter table public.menus
alter column document_slug set not null;

create unique index if not exists menus_restaurant_document_slug_key
on public.menus(restaurant_id, document_slug);

create index if not exists menus_restaurant_document_slug_idx
on public.menus(restaurant_id, document_slug);
