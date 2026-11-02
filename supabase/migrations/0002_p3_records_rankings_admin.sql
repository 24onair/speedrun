-- SPEED RUN P3 — 기록·자동 순위·관리자 권한·아바타 스토리지

-- ── 관리자 플래그 ───────────────────────────────────────────────
alter table public.profiles add column is_admin boolean not null default false;

-- RLS 정책에서 재귀 없이 쓰는 관리자 판별 함수
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- ── records: 관리자가 입력하는 비행 기록 ────────────────────────
create table public.records (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id),
  pilot_id uuid not null references public.profiles (id) on delete cascade,
  class text not null check (class in ('EN-B', 'EN-C', 'EN-D/CCC')),
  time_ms integer not null check (time_ms > 0),
  flown_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

alter table public.records enable row level security;

create policy "records: public read"
  on public.records for select using (true);
create policy "records: admin insert"
  on public.records for insert with check (public.is_admin());
create policy "records: admin update"
  on public.records for update using (public.is_admin());
create policy "records: admin delete"
  on public.records for delete using (public.is_admin());

-- ── 관리자: 신청자 관리 / 일정 관리 ─────────────────────────────
create policy "registrations: admin read"
  on public.registrations for select using (public.is_admin());
create policy "registrations: admin update"
  on public.registrations for update using (public.is_admin());

create policy "events: admin insert"
  on public.events for insert with check (public.is_admin());
create policy "events: admin update"
  on public.events for update using (public.is_admin());

-- ── 순위 뷰: 선수별 베스트 기록 (시즌 리더보드의 소스) ──────────
create view public.leaderboard
with (security_invoker = on) as
select distinct on (r.pilot_id)
  r.pilot_id,
  p.name,
  p.name_en,
  p.avatar_url,
  p.org,
  r.class,
  r.time_ms,
  r.flown_on,
  r.event_id
from public.records r
join public.profiles p on p.id = r.pilot_id
order by r.pilot_id, r.time_ms asc;

-- ── 아바타 스토리지 (공개 읽기, 본인 폴더만 쓰기) ───────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatars: own upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: own update"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
