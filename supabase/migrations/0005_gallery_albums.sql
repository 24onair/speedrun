-- 갤러리 앨범: 하나의 포스트에 사진·영상 여러 개 + 항목별 설명

create table public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  created_at timestamptz not null default now()
);

alter table public.gallery_albums enable row level security;

create policy "albums: public read"
  on public.gallery_albums for select using (true);
create policy "albums: admin insert"
  on public.gallery_albums for insert with check (public.is_admin());
create policy "albums: admin update"
  on public.gallery_albums for update using (public.is_admin());
create policy "albums: admin delete"
  on public.gallery_albums for delete using (public.is_admin());

alter table public.gallery_items
  add column album_id uuid references public.gallery_albums (id) on delete cascade;
alter table public.gallery_items
  add column sort integer not null default 0;
