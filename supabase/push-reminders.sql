-- Run after reviewing in the Supabase SQL editor. All push credentials stay server-side.
create table if not exists public.earpa_push_subscriptions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 endpoint text not null unique, p256dh text not null, auth text not null,
 local_time text not null check(local_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
 timezone text not null default 'UTC', enabled boolean not null default true,
 last_sent_day date, claimed_at timestamptz, created_at timestamptz not null default now()
);
alter table public.earpa_push_subscriptions enable row level security;
drop policy if exists own_push_subscription on public.earpa_push_subscriptions;
create policy own_push_subscription on public.earpa_push_subscriptions for all to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
-- Lock one batch; leases avoid concurrent cron invocations delivering the same reminder.
create or replace function public.claim_due_earpa_reminders()
returns setof public.earpa_push_subscriptions language sql security definer set search_path=public as $$
 update public.earpa_push_subscriptions s set claimed_at=now()
 where s.id in (
  select p.id from public.earpa_push_subscriptions p
  join pg_timezone_names z on z.name=p.timezone
  where p.enabled and (p.claimed_at is null or p.claimed_at<now()-interval '10 minutes')
  and p.last_sent_day is distinct from (now() at time zone p.timezone)::date
  and (now() at time zone p.timezone)::time >= p.local_time::time
  and extract(epoch from ((now() at time zone p.timezone)::time - p.local_time::time)) < 3600
  order by p.created_at limit 100 for update of p skip locked
 ) returning s.*;
$$;
revoke all on function public.claim_due_earpa_reminders() from public,anon,authenticated;
grant execute on function public.claim_due_earpa_reminders() to service_role;
