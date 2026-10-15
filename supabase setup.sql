-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- Gridiron Prep GM · Online Play database (Supabase) · v2.13: profiles and saves on your account
-- Run once: Supabase dashboard → SQL Editor → New query → paste this whole file → Run.
-- It is safe to run again later (it updates the rules without touching saved data).
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- 1) PROFILES: one per account; the username is what friends search for ─────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text not null check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  created_at  timestamptz not null default now()
);
create unique index if not exists profiles_username_ci on public.profiles (lower(username));
alter table public.profiles enable row level security;

drop policy if exists "Usernames are public" on public.profiles;
create policy "Usernames are public" on public.profiles
  for select to anon, authenticated using (true);
drop policy if exists "Players rename only themselves" on public.profiles;
create policy "Players rename only themselves" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (username) on public.profiles to authenticated;

-- the game sends the username with the sign-up; the profile is created from it automatically
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username) values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) FRIENDS: a request becomes a friendship when the other player accepts ────────────────────────
create table if not exists public.friendships (
  id          bigint generated always as identity primary key,
  requester   uuid not null references public.profiles (id) on delete cascade,
  addressee   uuid not null references public.profiles (id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at  timestamptz not null default now(),
  check (requester <> addressee)
);
create unique index if not exists friendships_pair
  on public.friendships (least(requester, addressee), greatest(requester, addressee));
alter table public.friendships enable row level security;

drop policy if exists "See your own friendships" on public.friendships;
create policy "See your own friendships" on public.friendships
  for select to authenticated using ((select auth.uid()) in (requester, addressee));
drop policy if exists "Send friend requests" on public.friendships;
create policy "Send friend requests" on public.friendships
  for insert to authenticated with check ((select auth.uid()) = requester and status = 'pending');
drop policy if exists "Accept requests sent to you" on public.friendships;
create policy "Accept requests sent to you" on public.friendships
  for update to authenticated using ((select auth.uid()) = addressee)
  with check ((select auth.uid()) = addressee and status = 'accepted');
drop policy if exists "Remove your own friendships" on public.friendships;
create policy "Remove your own friendships" on public.friendships
  for delete to authenticated using ((select auth.uid()) in (requester, addressee));

revoke all on public.friendships from anon, authenticated;
grant select, insert, delete on public.friendships to authenticated;
grant update (status) on public.friendships to authenticated;   -- accepting can only change the status

create or replace function public.is_friend(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester = a and f.addressee = b) or (f.requester = b and f.addressee = a)));
$$;
revoke all on function public.is_friend(uuid, uuid) from public, anon;
grant execute on function public.is_friend(uuid, uuid) to authenticated;

-- 3) MATCHES: the host saves the final; it counts once the guest's game confirms it ───────────────
create table if not exists public.matches (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  code         text,
  host_id      uuid not null references public.profiles (id) on delete cascade,
  guest_id     uuid references public.profiles (id) on delete set null,
  host_name    text,
  guest_name   text,
  host_team    jsonb,
  guest_team   jsonb,
  host_score   int not null check (host_score between 0 and 255),
  guest_score  int not null check (guest_score between 0 and 255),
  ot           boolean not null default false,
  summary      jsonb,
  guest_ok     boolean not null default false,
  check (guest_id is null or guest_id <> host_id)
);
create index if not exists matches_host_idx on public.matches (host_id);
create index if not exists matches_guest_idx on public.matches (guest_id);
alter table public.matches enable row level security;

drop policy if exists "Games of you and your friends" on public.matches;
create policy "Games of you and your friends" on public.matches
  for select to authenticated using (
    (select auth.uid()) in (host_id, guest_id)
    or public.is_friend((select auth.uid()), host_id)
    or (guest_id is not null and public.is_friend((select auth.uid()), guest_id)));
drop policy if exists "Hosts save their own games" on public.matches;
create policy "Hosts save their own games" on public.matches
  for insert to authenticated with check ((select auth.uid()) = host_id and guest_ok = false);

revoke all on public.matches from anon, authenticated;
grant select, insert on public.matches to authenticated;

-- the guest's game confirms the final score it saw; only then does the game count in the records
create or replace function public.confirm_match(mid bigint) returns void
language sql security definer set search_path = '' as $$
  update public.matches set guest_ok = true where id = mid and guest_id = auth.uid();
$$;
revoke all on function public.confirm_match(bigint) from public, anon;
grant execute on function public.confirm_match(bigint) to authenticated;

-- 4) PROFILES, v2.13: display name, emblem avatar, bio and home state ───────────────────────────
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists avatar       jsonb;
alter table public.profiles add column if not exists bio          text;
alter table public.profiles add column if not exists home_state   text;
alter table public.profiles drop constraint if exists profiles_display_name_len;
alter table public.profiles add constraint profiles_display_name_len check (display_name is null or char_length(display_name) <= 24);
alter table public.profiles drop constraint if exists profiles_bio_len;
alter table public.profiles add constraint profiles_bio_len check (bio is null or char_length(bio) <= 120);
alter table public.profiles drop constraint if exists profiles_home_state_len;
alter table public.profiles add constraint profiles_home_state_len check (home_state is null or char_length(home_state) <= 3);
alter table public.profiles drop constraint if exists profiles_avatar_size;
alter table public.profiles add constraint profiles_avatar_size check (avatar is null or pg_column_size(avatar) <= 400);
-- players can change these fields of their own profile (the policy above already limits updates to yourself)
grant update (username, display_name, avatar, bio, home_state) on public.profiles to authenticated;

-- 5) SAVES ON YOUR ACCOUNT, v2.13: compressed career saves in a private storage folder per player ───
create table if not exists public.cloud_saves (
  user_id     uuid not null references auth.users (id) on delete cascade,
  id          text not null check (id ~ '^[A-Za-z0-9_-]{1,40}$'),
  meta        jsonb not null default '{}'::jsonb check (pg_column_size(meta) <= 2000),
  size        bigint not null default 0,
  enc         text not null default 'gzip' check (enc in ('gzip', 'raw')),
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.cloud_saves enable row level security;
drop policy if exists "Your own save list" on public.cloud_saves;
create policy "Your own save list" on public.cloud_saves
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.cloud_saves from anon, authenticated;
grant select, insert, update, delete on public.cloud_saves to authenticated;

-- the files themselves: bucket "saves", private, up to 50 MB per save; each player only reaches the folder named after their id
insert into storage.buckets (id, name, public, file_size_limit)
values ('saves', 'saves', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "Own save files: read" on storage.objects;
create policy "Own save files: read" on storage.objects
  for select to authenticated using (bucket_id = 'saves' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Own save files: add" on storage.objects;
create policy "Own save files: add" on storage.objects
  for insert to authenticated with check (bucket_id = 'saves' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Own save files: replace" on storage.objects;
create policy "Own save files: replace" on storage.objects
  for update to authenticated using (bucket_id = 'saves' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'saves' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Own save files: delete" on storage.objects;
create policy "Own save files: delete" on storage.objects
  for delete to authenticated using (bucket_id = 'saves' and (storage.foldername(name))[1] = (select auth.uid())::text);
