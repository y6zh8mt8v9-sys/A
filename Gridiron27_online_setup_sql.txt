-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- Gridiron 27 (beta) · Online Play database (Supabase): everything online needs in one script (accounts, matches, friends, cloud saves, saves with friends, blocks, reports, community teams and worlds)
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

-- 6) v2.14: DELETE YOUR ACCOUNT, BLOCK AND REPORT PLAYERS, SEND SAVES TO FRIENDS ──────────────────────
-- (required by the App Store: players who can create an account must be able to delete it in the game)

-- blocks: a blocked player can't send you friend requests or saves, and disappears from your searches
create table if not exists public.blocks (
  blocker     uuid not null references public.profiles (id) on delete cascade,
  blocked     uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker, blocked),
  check (blocker <> blocked)
);
alter table public.blocks enable row level security;
drop policy if exists "Your own blocks" on public.blocks;
create policy "Your own blocks" on public.blocks
  for all to authenticated using ((select auth.uid()) = blocker) with check ((select auth.uid()) = blocker);
revoke all on public.blocks from anon, authenticated;
grant select, insert, delete on public.blocks to authenticated;

create or replace function public.is_blocked(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.blocks k where (k.blocker = a and k.blocked = b) or (k.blocker = b and k.blocked = a));
$$;
revoke all on function public.is_blocked(uuid, uuid) from public, anon;
grant execute on function public.is_blocked(uuid, uuid) to authenticated;

-- friend requests can't be sent between players where either one blocked the other
drop policy if exists "Send friend requests" on public.friendships;
create policy "Send friend requests" on public.friendships
  for insert to authenticated with check ((select auth.uid()) = requester and status = 'pending' and not public.is_blocked(requester, addressee));

-- reports: players can file them, only the project owner reads them (Supabase dashboard → Table Editor → reports)
create table if not exists public.reports (
  id          bigint generated always as identity primary key,
  reporter    uuid not null references public.profiles (id) on delete cascade,
  reported    uuid not null references public.profiles (id) on delete cascade,
  reason      text not null check (char_length(reason) between 1 and 300),
  created_at  timestamptz not null default now()
);
alter table public.reports enable row level security;
drop policy if exists "File a report" on public.reports;
create policy "File a report" on public.reports
  for insert to authenticated with check ((select auth.uid()) = reporter);
revoke all on public.reports from anon, authenticated;
grant insert on public.reports to authenticated;

-- saves sent to friends: a copy goes into the friend's inbox (bucket "shared", folder <recipient>/<sender>/)
create table if not exists public.shared_saves (
  id          bigint generated always as identity primary key,
  sender      uuid not null references public.profiles (id) on delete cascade,
  recipient   uuid not null references public.profiles (id) on delete cascade,
  meta        jsonb not null default '{}'::jsonb check (pg_column_size(meta) <= 2000),
  path        text not null,
  enc         text not null default 'gzip' check (enc in ('gzip', 'raw')),
  size        bigint not null default 0,
  created_at  timestamptz not null default now()
);
alter table public.shared_saves enable row level security;
drop policy if exists "Sent and received saves" on public.shared_saves;
create policy "Sent and received saves" on public.shared_saves
  for select to authenticated using ((select auth.uid()) in (sender, recipient));
drop policy if exists "Send a save to a friend" on public.shared_saves;
create policy "Send a save to a friend" on public.shared_saves
  for insert to authenticated with check ((select auth.uid()) = sender and public.is_friend(sender, recipient) and not public.is_blocked(sender, recipient)
    and path like recipient::text || '/' || sender::text || '/%');
drop policy if exists "Remove sent or received saves" on public.shared_saves;
create policy "Remove sent or received saves" on public.shared_saves
  for delete to authenticated using ((select auth.uid()) in (sender, recipient));
revoke all on public.shared_saves from anon, authenticated;
grant select, insert, delete on public.shared_saves to authenticated;

insert into storage.buckets (id, name, public, file_size_limit)
values ('shared', 'shared', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "Shared saves: send" on storage.objects;
create policy "Shared saves: send" on storage.objects
  for insert to authenticated with check (bucket_id = 'shared' and (storage.foldername(name))[2] = (select auth.uid())::text
    and public.is_friend((select auth.uid()), ((storage.foldername(name))[1])::uuid) and not public.is_blocked((select auth.uid()), ((storage.foldername(name))[1])::uuid));
drop policy if exists "Shared saves: read" on storage.objects;
create policy "Shared saves: read" on storage.objects
  for select to authenticated using (bucket_id = 'shared' and (select auth.uid())::text in ((storage.foldername(name))[1], (storage.foldername(name))[2]));
drop policy if exists "Shared saves: delete" on storage.objects;
create policy "Shared saves: delete" on storage.objects
  for delete to authenticated using (bucket_id = 'shared' and (select auth.uid())::text in ((storage.foldername(name))[1], (storage.foldername(name))[2]));

-- delete your own account: the game removes your files first, then this deletes the account and (by cascade)
-- your profile, friendships, blocks, reports, cloud save list, shared saves and the games you hosted
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- 7) v2.15: COMMUNITY TEAMS: Free Practice teams players publish for everyone to download ─────────────
create table if not exists public.community_teams (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  username text not null default '',
  name text not null check (char_length(name) between 1 and 80),
  ovr int not null default 60,
  data jsonb not null check (pg_column_size(data) < 200000),
  downloads int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists community_teams_created on public.community_teams (created_at desc);
create index if not exists community_teams_owner on public.community_teams (owner);
alter table public.community_teams enable row level security;
drop policy if exists "Read community teams" on public.community_teams;
create policy "Read community teams" on public.community_teams
  for select to authenticated using (true);
drop policy if exists "Publish your own teams" on public.community_teams;
create policy "Publish your own teams" on public.community_teams
  for insert to authenticated with check ((select auth.uid()) = owner
    and (select count(*) from public.community_teams c where c.owner = (select auth.uid())) < 20);
drop policy if exists "Remove your own teams" on public.community_teams;
create policy "Remove your own teams" on public.community_teams
  for delete to authenticated using ((select auth.uid()) = owner);
revoke all on public.community_teams from anon, authenticated;
grant select, insert, delete on public.community_teams to authenticated;

-- counts a download without letting anyone edit other players' teams
create or replace function public.community_download(tid uuid) returns void
language sql security definer set search_path = '' as $$
  update public.community_teams set downloads = downloads + 1 where id = tid;
$$;
revoke all on function public.community_download(uuid) from public, anon;
grant execute on function public.community_download(uuid) to authenticated;

-- ───────────────────────────────────────────────────────────────────────────
-- 8. Community Creations: worlds (League Setup with real or custom states) that players share
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.community_worlds (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  username text not null default '',
  name text not null check (char_length(name) between 1 and 80),
  info text not null default '' check (char_length(info) <= 200),
  data jsonb not null check (pg_column_size(data) < 400000),
  downloads int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists community_worlds_created on public.community_worlds (created_at desc);
create index if not exists community_worlds_owner on public.community_worlds (owner);
alter table public.community_worlds enable row level security;
drop policy if exists "Read community worlds" on public.community_worlds;
create policy "Read community worlds" on public.community_worlds
  for select to authenticated using (true);
drop policy if exists "Publish your own worlds" on public.community_worlds;
create policy "Publish your own worlds" on public.community_worlds
  for insert to authenticated with check ((select auth.uid()) = owner
    and (select count(*) from public.community_worlds w where w.owner = (select auth.uid())) < 10);
drop policy if exists "Remove your own worlds" on public.community_worlds;
create policy "Remove your own worlds" on public.community_worlds
  for delete to authenticated using ((select auth.uid()) = owner);
revoke all on public.community_worlds from anon, authenticated;
grant select, insert, delete on public.community_worlds to authenticated;

-- counts a download without letting anyone edit other players' worlds
create or replace function public.community_world_download(wid uuid) returns void
language sql security definer set search_path = '' as $$
  update public.community_worlds set downloads = downloads + 1 where id = wid;
$$;
revoke all on function public.community_world_download(uuid) from public, anon;
grant execute on function public.community_world_download(uuid) to authenticated;

-- ───────────────────────────────────────────────────────────────────────────
-- 9. Community Creations: leagues (whole career saves) that players share
--    The save file sits in the private bucket "community" in the owner's folder; every signed-in player can read it.
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.community_leagues (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  username text not null default '',
  name text not null check (char_length(name) between 1 and 80),
  info text not null default '' check (char_length(info) <= 200),
  path text not null,
  enc text not null default 'gzip' check (enc in ('gzip', 'raw')),
  size bigint not null default 0,
  downloads int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists community_leagues_created on public.community_leagues (created_at desc);
create index if not exists community_leagues_owner on public.community_leagues (owner);
alter table public.community_leagues enable row level security;
drop policy if exists "Read community leagues" on public.community_leagues;
create policy "Read community leagues" on public.community_leagues
  for select to authenticated using (true);
drop policy if exists "Publish your own leagues" on public.community_leagues;
create policy "Publish your own leagues" on public.community_leagues
  for insert to authenticated with check ((select auth.uid()) = owner
    and path like owner::text || '/%'
    and (select count(*) from public.community_leagues l where l.owner = (select auth.uid())) < 5);
drop policy if exists "Remove your own leagues" on public.community_leagues;
create policy "Remove your own leagues" on public.community_leagues
  for delete to authenticated using ((select auth.uid()) = owner);
revoke all on public.community_leagues from anon, authenticated;
grant select, insert, delete on public.community_leagues to authenticated;

-- counts a download without letting anyone edit other players' leagues
create or replace function public.community_league_download(lid uuid) returns void
language sql security definer set search_path = '' as $$
  update public.community_leagues set downloads = downloads + 1 where id = lid;
$$;
revoke all on function public.community_league_download(uuid) from public, anon;
grant execute on function public.community_league_download(uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit)
values ('community', 'community', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "Community leagues: publish" on storage.objects;
create policy "Community leagues: publish" on storage.objects
  for insert to authenticated with check (bucket_id = 'community' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Community leagues: read" on storage.objects;
create policy "Community leagues: read" on storage.objects
  for select to authenticated using (bucket_id = 'community');
drop policy if exists "Community leagues: delete" on storage.objects;
create policy "Community leagues: delete" on storage.objects
  for delete to authenticated using (bucket_id = 'community' and (storage.foldername(name))[1] = (select auth.uid())::text);
