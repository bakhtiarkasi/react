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


create table public.tenants (
  id uuid not null default gen_random_uuid(),
  full_name text not null,
  father_name text null,
  cnic text null,
  phone text null,
  alternate_phone text null,
  permanent_address text null,
  notes text null,
  is_active boolean not null default true, 
  created_at timestamp with time zone not null default now(),
  constraint tenants_pkey primary key (id)
) TABLESPACE pg_default;

-- 2. Define the conditional unique index immediately after
create unique index tenant_cnic_unique 
on public.tenants (cnic) 
where cnic is not null;

create table public.leases (
  id uuid not null default gen_random_uuid(),
  unit_id uuid not null,
  tenant_id uuid not null,
  start_date date not null,
  contract_end_date date null,
  actual_end_date date null,
  status text not null default 'active',
  agreed_security_deposit numeric(12,2) not null default 0,
  default_increase_percent numeric(5,2) null,
  increase_interval_months integer null,
  next_increase_date date null,
  notes text null,
  created_at timestamptz not null default now(),

  constraint leases_pkey primary key (id),
  constraint leases_tenant_id_fkey foreign KEY (tenant_id) references tenants (id),
  constraint leases_unit_id_fkey foreign KEY (unit_id) references units (id),
  constraint leases_status_check check (status in ('active', 'ended', 'terminated')),
  constraint leases_security_deposit_check check (agreed_security_deposit >= 0),
  constraint leases_increase_percent_check check (default_increase_percent is null or default_increase_percent >= 0),
  constraint leases_increase_interval_check check (increase_interval_months is null or increase_interval_months > 0),
  constraint leases_contract_dates_check check (contract_end_date is null or contract_end_date >= start_date),
  constraint leases_actual_end_date_check check (actual_end_date is null or actual_end_date >= start_date),
  -- ACTIVE → no actual end date, ENDED → must have actual end date, TERMINATED → must have actual end date
  constraint leases_status_end_date_check
  check (
    (status = 'active' and actual_end_date is null)
    or
    (status in ('ended', 'terminated') and actual_end_date is not null)
  )
) TABLESPACE pg_default;

alter table public.leases
add column termination_reason text null;

ALTER TABLE public.leases
ADD CONSTRAINT leases_increase_settings_check
CHECK (
  (
    default_increase_percent IS NULL
    AND increase_interval_months IS NULL
    AND next_increase_date IS NULL
  )
  OR
  (
    default_increase_percent IS NOT NULL
    AND increase_interval_months IS NOT NULL
    AND next_increase_date IS NOT NULL
  )
);


-- only one active lease per unit is allowed
create unique index leases_one_active_per_unit
on public.leases(unit_id)
where status = 'active';


create table public.rent_rates (
  id uuid not null default gen_random_uuid(),
  lease_id uuid not null,
  effective_from date not null,
  effective_to date null,
  monthly_rent numeric(12,2) not null,
  increase_percent numeric(5,2) null,
  reason text null,
  created_by uuid null,
  created_at timestamptz not null default now(),
  constraint rent_rates_pkey primary key (id),
  constraint rent_rates_lease_fkey foreign KEY (lease_id) references leases (id),
  constraint rent_rates_created_by_fkey foreign KEY (created_by) references user_profiles (id),
  constraint rent_rates_monthly_rent_check check (monthly_rent > 0),
  constraint rent_rates_effective_dates_check check (effective_to is null or effective_to >= effective_from),
  constraint rent_rates_lease_effective_from_unique unique (lease_id, effective_from),
  constraint rent_rates_increase_percent_check check (increase_percent is null or increase_percent >= 0)
  ) TABLESPACE pg_default;


-- only allow One-open-rate-per-lease at this stage.
create unique index rent_rates_one_open_rate_per_lease
on public.rent_rates(lease_id)
where effective_to is null;


