-- =============================================
-- 관광 패키지 추천 서비스 DB 스키마
-- Supabase SQL Editor에서 순서대로 실행
-- =============================================

-- profiles (auth.users 와 1:1 연결)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamptz
);

alter table public.profiles enable row level security;

create policy "본인만 조회" on public.profiles
  for select using (auth.uid() = id);

create policy "본인만 수정" on public.profiles
  for update using (auth.uid() = id);

-- 신규 가입 시 profiles 자동 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================

-- preference_profiles
create table if not exists public.preference_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  companion_type text not null check (companion_type in ('solo','couple','family','friends')),
  nature_preference text[] not null default '{}',
  activity_level text not null check (activity_level in ('low','medium','high')),
  avoid_crowd boolean not null default false,
  has_pet boolean not null default false,
  prefer_wellness boolean not null default false,
  prefer_camping boolean not null default false,
  raw_chat jsonb,
  created_at timestamptz not null default now()
);

alter table public.preference_profiles enable row level security;

create policy "본인만 조회" on public.preference_profiles
  for select using (auth.uid() = user_id);

create policy "본인만 삽입" on public.preference_profiles
  for insert with check (auth.uid() = user_id);

create policy "본인만 수정" on public.preference_profiles
  for update using (auth.uid() = user_id);

-- =============================================

-- trending_spots (캐싱, RLS 없음 — 전체 공개 읽기)
create table if not exists public.trending_spots (
  id uuid primary key default gen_random_uuid(),
  area_code text not null,
  area_name text not null,
  rank integer not null,
  fetched_at timestamptz not null default now()
);

alter table public.trending_spots enable row level security;

create policy "전체 읽기 허용" on public.trending_spots
  for select using (true);

-- service_role만 쓰기 (RLS에서 insert/update 정책 없음 → service key만 가능)

-- =============================================

-- packages
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  preference_id uuid not null references public.preference_profiles(id) on delete cascade,
  spots jsonb not null default '[]',
  accommodations jsonb not null default '[]',
  recommended_dates jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.packages enable row level security;

create policy "본인만 조회" on public.packages
  for select using (auth.uid() = user_id);

create policy "본인만 삽입" on public.packages
  for insert with check (auth.uid() = user_id);

create policy "본인만 삭제" on public.packages
  for delete using (auth.uid() = user_id);

-- =============================================

-- bookmarks
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid not null references public.packages(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, package_id)
);

alter table public.bookmarks enable row level security;

create policy "본인만 조회" on public.bookmarks
  for select using (auth.uid() = user_id);

create policy "본인만 삽입" on public.bookmarks
  for insert with check (auth.uid() = user_id);

create policy "본인만 삭제" on public.bookmarks
  for delete using (auth.uid() = user_id);
