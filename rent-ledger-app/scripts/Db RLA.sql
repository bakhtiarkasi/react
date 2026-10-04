-- recommend keeping authorization helpers outside the exposed public schema
create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

-- create utility function to retrieve user profile
--return only active users roles form the user role table
create or replace function private.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.user_profiles
  where id = (select auth.uid())
    and is_active = true
$$;

-- restrict function execution:
revoke execute
on function private.current_user_role()
from public;

grant execute
on function private.current_user_role()
to authenticated;


-- RLA for User profiles 
-- users can read their own profile only
create policy "Users can read own profile"
on public.user_profiles
for select
to authenticated
using (
  id = (select auth.uid())
);


-- admins can read all profiles
create policy "Admins can read all profiles"
on public.user_profiles
for select
to authenticated
using (
  (select private.current_user_role()) = 'admin'
);


--- RLA for Properties table
alter table public.properties
enable row level security;

-- staff can read properties minus tenants
create policy "Staff can read properties"
on public.properties
for select
to authenticated
using (
  (select private.current_user_role())
    in ('admin', 'collector', 'support')
);

-- admin can create properties, For INSERT, notice that we use [with check]
-- USING → Which existing rows may I access? WITH CHECK → Which new/modified rows am I allowed to create?
create policy "Admins can create properties"
on public.properties
for insert
to authenticated
with check (
  (select private.current_user_role()) = 'admin'
);

-- admin can update properties
create policy "Admins can update properties"
on public.properties
for update
to authenticated
using (
  (select private.current_user_role()) = 'admin'
)
with check (
  (select private.current_user_role()) = 'admin'
);



--- RLA to Secure units 
alter table public.units
enable row level security;

-- staff can read units
create policy "Staff can read units"
on public.units
for select
to authenticated
using (
  (select private.current_user_role())
    in ('admin', 'collector', 'support')
);

-- admin can create new units
create policy "Admins can create units"
on public.units
for insert
to authenticated
with check (
  (select private.current_user_role()) = 'admin'
);

-- admin can update units
create policy "Admins can update units"
on public.units
for update
to authenticated
using (
  (select private.current_user_role()) = 'admin'
)
with check (
  (select private.current_user_role()) = 'admin'
);



--- PostgreSQL grants
--- A grant answers: Is the authenticated database role allowed to attempt this operation at all?
--- RLS answers: Which rows is this particular authenticated user allowed to operate on?

-- For our app, I would explicitly remove anonymous access:
revoke all
on public.user_profiles,
   public.properties,
   public.units
from anon;

-- For profiles: We deliberately grant only the operations the application needs.
revoke all on public.user_profiles from authenticated;
-- grant only select 
grant select
on public.user_profiles
to authenticated;


-- For properties and units:
revoke all
on public.properties,
   public.units
from authenticated;

-- grant everything except delete
grant select, insert, update
on public.properties,
   public.units
to authenticated;
