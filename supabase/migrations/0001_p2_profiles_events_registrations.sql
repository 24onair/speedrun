-- SPEED RUN P2 — 선수 프로필 / 대회 일정 / 참가신청
-- Supabase SQL Editor에 그대로 붙여넣어 실행하거나 `supabase db push`로 적용

-- ── profiles: 선수 프로필 (auth.users 1:1) ──────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  name_en text,
  phone text,
  org text,                     -- 소속
  glider text,                  -- 기체
  license text,                 -- 자격증 (PARA 1~4)
  class text check (class in ('EN-B', 'EN-C', 'EN-D/CCC')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: public read"
  on public.profiles for select using (true);
create policy "profiles: own insert"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: own update"
  on public.profiles for update using (auth.uid() = id);

-- 가입 시 프로필 자동 생성 (name은 metadata에서)
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', '이름 미입력'),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── events: 대회 일정 ───────────────────────────────────────────
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  status text not null default 'open' check (status in ('open', 'closed', 'done')),
  capacity int,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "events: public read"
  on public.events for select using (true);

-- ── registrations: 참가신청 ─────────────────────────────────────
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id),
  class text not null check (class in ('EN-B', 'EN-C', 'EN-D/CCC')),
  checklist jsonb not null,          -- 장비·자격 체크 6문항 {key: true}
  agree_waiver boolean not null default false,
  agree_privacy boolean not null default false,
  agree_media boolean not null default false,
  depositor_name text not null,      -- 무통장입금 입금자명
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

alter table public.registrations enable row level security;

create policy "registrations: own read"
  on public.registrations for select using (auth.uid() = user_id);
create policy "registrations: own insert"
  on public.registrations for insert with check (auth.uid() = user_id);
-- 상태 변경(입금확인·취소)은 P3 관리자(service role)에서 수행

-- ── 시드: 시즌 이벤트 1건 ───────────────────────────────────────
insert into public.events (title, event_date, status)
values ('SPEED RUN 시즌 오픈', current_date + interval '14 days', 'open');
