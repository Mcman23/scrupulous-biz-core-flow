-- Scrupulous Biz Core Flow — standalone Supabase schema
-- Run this once in Supabase Dashboard → SQL Editor → New query → Run

create extension if not exists "pgcrypto";

-- Helper: auto-update updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Profiles (extends auth.users with app-level fields like role)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure set_updated_at();

-- Companies
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  logo text,
  phone text,
  email text,
  address text,
  description text,
  status text not null default 'aktiv' check (status in ('aktiv','deaktiv')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger companies_updated_at before update on public.companies
  for each row execute procedure set_updated_at();

-- Clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  client_name text not null,
  company_name text,
  phone text,
  whatsapp text,
  email text,
  address text,
  industry text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger clients_updated_at before update on public.clients
  for each row execute procedure set_updated_at();

-- Services
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  name text not null,
  description text,
  price numeric,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger services_updated_at before update on public.services
  for each row execute procedure set_updated_at();

-- Leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  client_id uuid references public.clients(id) on delete cascade,
  source text,
  status text not null default 'Yeni müraciət',
  service_id uuid references public.services(id) on delete set null,
  budget numeric,
  assigned_user text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger leads_updated_at before update on public.leads
  for each row execute procedure set_updated_at();

-- Deals
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  amount numeric,
  status text not null default 'davam edir' check (status in ('davam edir','tamamlandı','ləğv edildi')),
  close_date date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger deals_updated_at before update on public.deals
  for each row execute procedure set_updated_at();

-- Expenses
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  amount numeric not null,
  category text not null default 'Digər',
  date date,
  description text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger expenses_updated_at before update on public.expenses
  for each row execute procedure set_updated_at();

-- Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  amount numeric,
  status text not null default 'gözləyir' check (status in ('ödənilib','gözləyir')),
  payment_date date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger payments_updated_at before update on public.payments
  for each row execute procedure set_updated_at();

-- Follow-ups
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  title text not null,
  reminder_date date,
  status text not null default 'gözləyir' check (status in ('gözləyir','tamamlandı')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger follow_ups_updated_at before update on public.follow_ups
  for each row execute procedure set_updated_at();

-- Activities
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  type text not null check (type in ('Zəng','WhatsApp','Görüş','Email')),
  description text,
  date date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger activities_updated_at before update on public.activities
  for each row execute procedure set_updated_at();

-- Row Level Security: any authenticated (logged-in) user of this app can read/write everything.
-- This matches a single-team CRM setup (not a multi-tenant SaaS).
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.leads enable row level security;
alter table public.deals enable row level security;
alter table public.expenses enable row level security;
alter table public.payments enable row level security;
alter table public.follow_ups enable row level security;
alter table public.activities enable row level security;

drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);

do $$
declare
  t text;
begin
  foreach t in array array['companies','clients','services','leads','deals','expenses','payments','follow_ups','activities']
  loop
    execute format('drop policy if exists "authenticated_all" on public.%I;', t);
    execute format('create policy "authenticated_all" on public.%I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');', t);
  end loop;
end $$;
