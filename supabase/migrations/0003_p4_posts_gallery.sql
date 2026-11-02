-- SPEED RUN P4 — 소식(공지/뉴스/이벤트) · 갤러리

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('notice', 'news', 'event')),
  title text not null,
  body text not null,
  title_en text,
  body_en text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "posts: public read published"
  on public.posts for select using (published or public.is_admin());
create policy "posts: admin insert"
  on public.posts for insert with check (public.is_admin());
create policy "posts: admin update"
  on public.posts for update using (public.is_admin());
create policy "posts: admin delete"
  on public.posts for delete using (public.is_admin());

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  caption_en text,
  taken_on date,
  created_at timestamptz not null default now()
);

alter table public.gallery_items enable row level security;

create policy "gallery: public read"
  on public.gallery_items for select using (true);
create policy "gallery: admin insert"
  on public.gallery_items for insert with check (public.is_admin());
create policy "gallery: admin delete"
  on public.gallery_items for delete using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "gallery bucket: public read"
  on storage.objects for select
  using (bucket_id = 'gallery');
create policy "gallery bucket: admin write"
  on storage.objects for insert
  with check (bucket_id = 'gallery' and public.is_admin());
create policy "gallery bucket: admin delete"
  on storage.objects for delete
  using (bucket_id = 'gallery' and public.is_admin());
