-- Vive Bilbao CRM V4 - migración sobre el CRM existente
-- Conserva las tablas/datos de V1-V3 y añade relaciones profesionales.

alter table public.clients add column if not exists client_type text not null default 'contact';
alter table public.clients add column if not exists dni text;
alter table public.clients add column if not exists address text;
alter table public.clients add column if not exists postal_code text;
alter table public.clients add column if not exists notes text;
alter table public.clients add column if not exists whatsapp text;

alter table public.properties add column if not exists client_id uuid;
alter table public.properties add column if not exists reference text;
alter table public.properties add column if not exists floor text;
alter table public.properties add column if not exists elevator boolean not null default false;
alter table public.properties add column if not exists terrace boolean not null default false;
alter table public.properties add column if not exists acquisition_date date;
alter table public.properties add column if not exists last_contact_at timestamptz;
alter table public.properties add column if not exists next_followup_at timestamptz;
alter table public.properties add column if not exists notes text;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='properties_client_id_fkey') THEN
    ALTER TABLE public.properties ADD CONSTRAINT properties_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  END IF;
END $$;

alter table public.orders add column if not exists operation text;
alter table public.orders add column if not exists min_area_m2 numeric;
alter table public.orders add column if not exists max_area_m2 numeric;
alter table public.orders add column if not exists bathrooms int;
alter table public.orders add column if not exists elevator_required boolean;
alter table public.orders add column if not exists terrace_required boolean;
alter table public.orders add column if not exists status text not null default 'active';
alter table public.orders add column if not exists next_followup_at timestamptz;
alter table public.orders add column if not exists notes text;

alter table public.events add column if not exists client_id uuid;
alter table public.events add column if not exists property_id uuid;
alter table public.events add column if not exists event_type text not null default 'other';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='events_client_id_fkey') THEN
    ALTER TABLE public.events ADD CONSTRAINT events_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='events_property_id_fkey') THEN
    ALTER TABLE public.events ADD CONSTRAINT events_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE SET NULL;
  END IF;
END $$;

create table if not exists public.tasks(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references public.profiles(id) on delete set null,
 client_id uuid references public.clients(id) on delete set null,
 property_id uuid references public.properties(id) on delete set null,
 title text not null,
 description text,
 due_at timestamptz,
 priority text not null default 'normal',
 status text not null default 'pending',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create index if not exists properties_client_idx on public.properties(client_id);
create index if not exists orders_client_idx on public.orders(client_id);
create index if not exists events_client_idx on public.events(client_id);
create index if not exists events_property_idx on public.events(property_id);
create index if not exists tasks_owner_idx on public.tasks(owner_id);
create index if not exists tasks_due_idx on public.tasks(due_at);

alter table public.tasks enable row level security;
drop policy if exists tasks_rw on public.tasks;
create policy tasks_rw on public.tasks for all using(owner_id=auth.uid() or public.is_admin()) with check(owner_id=auth.uid() or public.is_admin());

-- Permite a cada asesor consultar los clientes que son suyos; el admin ve todos.
-- Las relaciones se guardan con client_id/property_id y respetan las políticas existentes.
