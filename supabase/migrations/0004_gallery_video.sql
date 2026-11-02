-- 갤러리에 유튜브 영상 아이템 지원
alter table public.gallery_items add column video_url text;
alter table public.gallery_items alter column image_url drop not null;

-- 갤러리 수정 기능용 — 0003에서 빠졌던 admin update 정책
create policy "gallery: admin update"
  on public.gallery_items for update using (public.is_admin());
