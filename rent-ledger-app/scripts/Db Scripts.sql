create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null check (role in ('admin', 'collector', 'support', 'tenant')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.properties (
  id uuid not null default gen_random_uuid(),
  name text not null,
  address text null,
  notes text null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  constraint properties_pkey primary key (id)
) TABLESPACE pg_default;

create table public.units (
  id uuid not null default gen_random_uuid(),
  property_id uuid not null,
  unit_code text not null,
  unit_type text not null,
  description text null,
  operational_status text not null default 'active',
  created_at timestamp with time zone not null default now(),
  constraint units_pkey primary key (id),
  constraint units_properties_id_fkey foreign KEY (property_id) references properties (id),
  constraint units_operational_status_check check (
  operational_status in (
          'active'::text,
          'inactive'::text,
          'under_maintenance'::text,
          'not_rentable'::text
          )
      ),
  constraint units_property_unit_code_unique unique (property_id, unit_code),
  constraint units_type_check check (
  unit_type in (
    'shop'::text,
    'flat'::text,
    'shed'::text,
    'basement'::text,
    'service_station'::text,
    'warehouse'::text,
    'other'::text
  )
)
) TABLESPACE pg_default;



