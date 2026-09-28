create extension if not exists pgcrypto;
do $$ begin create type public.app_role as enum ('admin','advisor'); exception when duplicate_object then null; end $$;
do $$ begin create type public.property_status as enum ('active','reserved','sold','rented','inactive'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,full_name text,role public.app_role not null default 'advisor',active boolean not null default true,created_at timestamptz not null default now());
create table if not exists public.properties(id uuid primary key default gen_random_uuid(),owner_id uuid references public.profiles(id) on delete set null,title text not null,property_type text,city text,address text,price numeric,status public.property_status not null default 'active',visibility text not null default 'shared' check(visibility in('shared','private')),bedrooms int,bathrooms int,area_m2 numeric,description text,photo_urls text[] default '{}',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.clients(id uuid primary key default gen_random_uuid(),owner_id uuid references public.profiles(id) on delete set null,name text not null,email text,phone text,city text,notes text,created_at timestamptz not null default now());
create table if not exists public.orders(id uuid primary key default gen_random_uuid(),owner_id uuid references public.profiles(id) on delete set null,client_id uuid references public.clients(id) on delete set null,operation text,property_type text,city text,min_price numeric,max_price numeric,bedrooms int,notes text,created_at timestamptz not null default now());
create table if not exists public.acquisitions(id uuid primary key default gen_random_uuid(),owner_id uuid references public.profiles(id) on delete set null,contact_name text not null,phone text,email text,property_type text,city text,estimated_value numeric,status text default 'new',notes text,next_followup timestamptz,created_at timestamptz not null default now());
create table if not exists public.events(id uuid primary key default gen_random_uuid(),owner_id uuid references public.profiles(id) on delete set null,title text not null,start_at timestamptz not null,end_at timestamptz,location text,notes text,created_at timestamptz not null default now());
create table if not exists public.news(id uuid primary key default gen_random_uuid(),author_id uuid references public.profiles(id) on delete set null,title text not null,body text,created_at timestamptz not null default now());

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from public.profiles where id=auth.uid() and role='admin' and active=true);$$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$begin insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',new.email));return new;end;$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;alter table public.properties enable row level security;alter table public.clients enable row level security;alter table public.orders enable row level security;alter table public.acquisitions enable row level security;alter table public.events enable row level security;alter table public.news enable row level security;

drop policy if exists profiles_self_or_admin on public.profiles;
create policy profiles_self_or_admin on public.profiles for select using(id=auth.uid() or public.is_admin());

drop policy if exists properties_read on public.properties;
create policy properties_read on public.properties for select using(visibility='shared' or owner_id=auth.uid() or public.is_admin());
drop policy if exists properties_insert on public.properties;
create policy properties_insert on public.properties for insert with check(owner_id=auth.uid() or public.is_admin());
drop policy if exists properties_update on public.properties;
create policy properties_update on public.properties for update using(owner_id=auth.uid() or public.is_admin());
drop policy if exists properties_delete on public.properties;
create policy properties_delete on public.properties for delete using(owner_id=auth.uid() or public.is_admin());

drop policy if exists clients_rw on public.clients;
create policy clients_rw on public.clients for all using(owner_id=auth.uid() or public.is_admin()) with check(owner_id=auth.uid() or public.is_admin());
drop policy if exists orders_rw on public.orders;
create policy orders_rw on public.orders for all using(owner_id=auth.uid() or public.is_admin()) with check(owner_id=auth.uid() or public.is_admin());
drop policy if exists acquisitions_rw on public.acquisitions;
create policy acquisitions_rw on public.acquisitions for all using(owner_id=auth.uid() or public.is_admin()) with check(owner_id=auth.uid() or public.is_admin());
drop policy if exists events_rw on public.events;
create policy events_rw on public.events for all using(owner_id=auth.uid() or public.is_admin()) with check(owner_id=auth.uid() or public.is_admin());
drop policy if exists news_read on public.news;
create policy news_read on public.news for select using(auth.uid() is not null);
drop policy if exists news_write on public.news;
create policy news_write on public.news for all using(author_id=auth.uid() or public.is_admin()) with check(author_id=auth.uid() or public.is_admin());

create index if not exists properties_visibility_idx on public.properties(visibility);
create index if not exists properties_city_idx on public.properties(city);
create index if not exists clients_owner_idx on public.clients(owner_id);
create index if not exists events_start_idx on public.events(start_at);