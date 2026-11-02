-- 갤러리에 유튜브 영상 아이템 지원
alter table public.gallery_items add column video_url text;
alter table public.gallery_items alter column image_url drop not null;
