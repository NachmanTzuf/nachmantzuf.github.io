-- Owner-only records. Run once in the new Supabase project's SQL editor.
create table if not exists public.earpa_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null
);
create table if not exists public.earpa_records (
 user_id uuid not null references auth.users(id) on delete cascade,
 record_id text not null,
 kind text not null check (kind in ('trial','session')),
 payload jsonb not null,
 primary key(user_id,record_id)
);
alter table public.earpa_profiles enable row level security;
alter table public.earpa_records enable row level security;
create policy "profile_owner" on public.earpa_profiles for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "record_owner" on public.earpa_records for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.earpa_profiles, public.earpa_records from anon;
grant select,insert,update,delete on public.earpa_profiles, public.earpa_records to authenticated;
