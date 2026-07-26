-- TechRescue test database. Apply only to the techrescue-test Supabase project.
create extension if not exists pgcrypto;

create type public.app_role as enum ('client', 'engineer', 'admin');
create type public.ticket_status as enum ('open', 'in_progress', 'pending_client', 'resolved', 'closed', 'ignored');
create type public.ticket_priority as enum ('low', 'medium', 'high', 'critical');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  first_name text not null default '', last_name text not null default '',
  role public.app_role not null default 'client', phone text, country text, state text, city text,
  online boolean not null default false, last_seen_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.engineer_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  headline text, bio text, role_title text, categories text[] not null default '{}', skills text[] not null default '{}',
  years_experience smallint check (years_experience is null or years_experience >= 0),
  service_radius_km integer check (service_radius_km is null or service_radius_km >= 0),
  hourly_rate numeric(10,2) check (hourly_rate is null or hourly_rate >= 0),
  verified boolean not null default false, rating numeric(3,2) not null default 0 check (rating between 0 and 5),
  completed_jobs integer not null default 0, updated_at timestamptz not null default now()
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique default ('INC' || to_char(now(), 'YYYYMMDDHH24MISS') || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4))),
  client_id uuid not null references public.profiles(id) on delete restrict,
  assigned_engineer_id uuid references public.profiles(id) on delete set null,
  category text not null, subcategory text, assignment_group text,
  short_description text not null check (char_length(short_description) between 3 and 250),
  detailed_description text, impact text, urgency text,
  priority public.ticket_priority not null default 'medium', status public.ticket_status not null default 'open',
  resolution_note text, resolved_at timestamptz, closed_at timestamptz, due_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index tickets_client_status_idx on public.tickets (client_id, status, created_at desc);
create index tickets_engineer_status_idx on public.tickets (assigned_engineer_id, status, created_at desc);

create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(), ticket_id uuid not null references public.tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (char_length(trim(body)) > 0), is_internal boolean not null default false,
  read_at timestamptz, created_at timestamptz not null default now()
);
create index ticket_messages_ticket_created_idx on public.ticket_messages (ticket_id, created_at);

create table public.ticket_attachments (
  id uuid primary key default gen_random_uuid(), ticket_id uuid not null references public.tickets(id) on delete cascade,
  message_id uuid references public.ticket_messages(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id), bucket text not null default 'ticket-attachments',
  path text not null unique, file_name text not null, mime_type text, size_bytes bigint check (size_bytes >= 0),
  created_at timestamptz not null default now()
);

create table public.ticket_events (
  id bigint generated always as identity primary key, ticket_id uuid not null references public.tickets(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null, event_type text not null,
  from_status public.ticket_status, to_status public.ticket_status, details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index ticket_events_ticket_created_idx on public.ticket_events (ticket_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(), recipient_id uuid not null references public.profiles(id) on delete cascade,
  ticket_id uuid references public.tickets(id) on delete cascade, type text not null, title text not null, body text not null,
  read_at timestamptz, created_at timestamptz not null default now()
);
create index notifications_recipient_read_idx on public.notifications (recipient_id, read_at, created_at desc);

create table public.ticket_ratings (
  id uuid primary key default gen_random_uuid(), ticket_id uuid not null unique references public.tickets(id) on delete cascade,
  client_id uuid not null references public.profiles(id), engineer_id uuid not null references public.profiles(id),
  score smallint not null check (score between 1 and 5), comment text, created_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger profiles_updated before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger engineer_profiles_updated before update on public.engineer_profiles for each row execute procedure public.set_updated_at();
create trigger tickets_updated before update on public.tickets for each row execute procedure public.set_updated_at();

create or replace function public.create_profile_for_auth_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'first_name', ''), coalesce(new.raw_user_meta_data ->> 'last_name', ''), coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'client'));
  return new;
end; $$;
create trigger auth_user_profile_created after insert on auth.users for each row execute procedure public.create_profile_for_auth_user();

create or replace function public.record_ticket_event() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.ticket_events(ticket_id, actor_id, event_type, to_status, details) values(new.id, new.client_id, 'created', new.status, jsonb_build_object('ticket_number', new.ticket_number));
  elsif old.status is distinct from new.status then
    insert into public.ticket_events(ticket_id, actor_id, event_type, from_status, to_status) values(new.id, new.assigned_engineer_id, 'status_changed', old.status, new.status);
  end if;
  return new;
end; $$;
create trigger tickets_events after insert or update on public.tickets for each row execute procedure public.record_ticket_event();

create or replace function public.is_ticket_participant(target_id uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.tickets t where t.id = target_id and (t.client_id = auth.uid() or t.assigned_engineer_id = auth.uid() or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')));
$$;

alter table public.profiles enable row level security;
alter table public.engineer_profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.ticket_attachments enable row level security;
alter table public.ticket_events enable row level security;
alter table public.notifications enable row level security;
alter table public.ticket_ratings enable row level security;

create policy "profiles read" on public.profiles for select to authenticated using (true);
create policy "engineers manage own profile" on public.engineer_profiles for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ticket participants read" on public.tickets for select to authenticated using (public.is_ticket_participant(id));
create policy "clients create tickets" on public.tickets for insert to authenticated with check (client_id = auth.uid());
create policy "ticket messages read" on public.ticket_messages for select to authenticated using (public.is_ticket_participant(ticket_id));
create policy "ticket messages send" on public.ticket_messages for insert to authenticated with check (sender_id = auth.uid() and public.is_ticket_participant(ticket_id));
create policy "attachments read" on public.ticket_attachments for select to authenticated using (public.is_ticket_participant(ticket_id));
create policy "events read" on public.ticket_events for select to authenticated using (public.is_ticket_participant(ticket_id));
create policy "notifications own" on public.notifications for all to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
create policy "ratings read" on public.ticket_ratings for select to authenticated using (client_id = auth.uid() or engineer_id = auth.uid());
create policy "clients rate" on public.ticket_ratings for insert to authenticated with check (client_id = auth.uid());
