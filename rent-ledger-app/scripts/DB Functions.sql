create or replace function public.create_lease_with_initial_rent(
  p_unit_id uuid,
  p_tenant_id uuid,
  p_start_date date,
  p_contract_end_date date,
  p_security_deposit numeric,
  p_increase_percent numeric,
  p_increase_interval_months integer,
  p_next_increase_date date,
  p_initial_monthly_rent numeric,
  p_notes text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_lease_id uuid;

begin

if (select private.current_user_role())
   is distinct from 'admin' then
  raise exception 'Only administrators can create leases';
end if;

IF NOT EXISTS (
    SELECT 1 
    FROM public.tenants 
    WHERE id = p_tenant_id 
      AND is_active = true
) THEN
    RAISE EXCEPTION 'The tenant is not active so cannot create lease';
END IF;

if not exists (
  select 1
  from public.units
  where id = p_unit_id
    and operational_status = 'active'
) then
  raise exception 'The unit is not active or is not available for leasing';
end if;


 if p_initial_monthly_rent <= 0 then
    raise exception 'Initial monthly rent must be greater than zero';
  end if;

  if p_security_deposit < 0 then
    raise exception 'Security deposit cannot be negative';
  end if;

  insert into public.leases (
    unit_id,
    tenant_id,
    start_date,
    contract_end_date,
    agreed_security_deposit,
    default_increase_percent,
    increase_interval_months,
    next_increase_date,
    notes
  )
  values (
    p_unit_id,
    p_tenant_id,
    p_start_date,
    p_contract_end_date,
    p_security_deposit,
    p_increase_percent,
    p_increase_interval_months,
    p_next_increase_date,
    p_notes
  )
  returning id into new_lease_id;


  insert into public.rent_rates (
    lease_id,
    effective_from,
    effective_to,
    monthly_rent,
    increase_percent,
    reason,
    created_by
  )
  values (
    new_lease_id,
    p_start_date,
    null,
    p_initial_monthly_rent,
    null,
    'Initial contractual rent',
    (select auth.uid())
  );


  return new_lease_id;

end;
$$;





-- Grant specific access to this function
revoke execute
on function public.create_lease_with_initial_rent(
  uuid,
  uuid,
  date,
  date,
  numeric,
  numeric,
  integer,
  date,
  numeric,
  text
)
from public;

grant execute
on function public.create_lease_with_initial_rent(
  uuid,
  uuid,
  date,
  date,
  numeric,
  numeric,
  integer,
  date,
  numeric,
  text
)
to authenticated;




--- this is how to test teh stored procedure in sql:
--- first have to personate the admin as teh Stored Procedure has to be executed by admin role only
select id from public.user_profiles where role = 'admin' and is_active = true;

-- Step 2 — find an active tenant and Copy one tenant UUID.
select id from public.tenants where is_active = true;

-- Step 3 — find a genuinely available unit, and Choose one unit id
select u.id from public.units u
join public.properties p
  on p.id = u.property_id
where u.operational_status = 'active'
  and not exists (
    select 1
    from public.leases l
    where l.unit_id = u.id
      and l.status = 'active'
  );

-- Test 1 — confirm the simulated login first
--Before creating anything, test that PostgreSQL actually recognizes you as the Admin.
begin;

set local role authenticated;

set local request.jwt.claim.sub =
  '87fd7f9e-ddf3-4d76-a329-f6cc6e2cdd9e';

select
  auth.uid() as logged_in_user,
  private.current_user_role() as app_role;

rollback;



-- Test 3- run teh stored producre but don not commit, rollback afte rthe etst:
begin;

set local role authenticated;

set local request.jwt.claim.sub =
  '87fd7f9e-ddf3-4d76-a329-f6cc6e2cdd9e';


select public.create_lease_with_initial_rent(
  '62ae7c2b-22af-4f3e-b963-09137a556c1d'::uuid,
  '60061332-68a6-4290-a31e-517087674407'::uuid,
  date '2026-10-01',
  date '2028-09-30',
  50000,
  10,
  12,
  date '2027-10-01',
  25000,
  'SUCCESS TEST'
) as new_lease_id;

/* Still inside SAME transaction */
select
  l.id,
  l.status,
  l.start_date,
  rr.monthly_rent,
  rr.effective_from,
  rr.effective_to,
  rr.created_by
from public.leases l
join public.rent_rates rr
  on rr.lease_id = l.id
where l.notes = 'SUCCESS TEST';


--rollback



-- function public.end_lease
 create or replace function public.end_lease(
  p_lease_id uuid,
  p_actual_date date
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  updated_lease_id uuid;
  updated_rent_id uuid;

begin

if (select private.current_user_role())
   is distinct from 'admin' then
  raise exception 'Only administrators can update leases';
end if;

if p_actual_date > current_date then
  raise exception 'Actual end date cannot be in the future';
end if;

update public.leases
set
  actual_end_date = p_actual_date,
  status = 'ended'
where id = p_lease_id
  and status = 'active'
  and p_actual_date >= start_date
returning id into updated_lease_id;

if updated_lease_id is null then
  raise exception 'Lease is not active or actual end date is invalid';
end if;

update public.rent_rates
set effective_to = p_actual_date
where lease_id = p_lease_id
  and effective_to is null
  and p_actual_date >= effective_from
returning id into updated_rent_id;

if updated_rent_id is null then
  raise exception 'No open rent rate found for this lease';
end if;

 return updated_lease_id;

end;
$$;


-- Grant specific access to this function
revoke execute
on function public.end_lease(
  uuid,
  date
)
from public;

grant execute
on function public.end_lease(
  uuid,
  date
)
to authenticated;

 
-- testing scripts
begin;

set local role authenticated;

set local request.jwt.claim.sub =
  '87fd7f9e-ddf3-4d76-a329-f6cc6e2cdd9e';


select public.end_lease(
  'f4dacc58-e58f-400d-be08-78298d969881'::uuid,
  date '2026-05-09' 
) as updated_lease_id;

/* Still inside SAME transaction */
select
  l.id,
  l.status,
  l.start_date,
  l.actual_end_date,
  rr.effective_from,
  rr.effective_to
from public.leases l
join public.rent_rates rr
  on rr.lease_id = l.id
where l.id = 'f4dacc58-e58f-400d-be08-78298d969881'
and rr.id = '3a9960f5-93d5-4fe5-b5ce-f9d56266e4ca';


--rollback




  -- function public.terminate_lease
 --public.terminate_lease
 create or replace function public.terminate_lease(
  p_lease_id uuid,
  p_actual_date date,
  p_termination_reason text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  updated_lease_id uuid;
  updated_rent_id uuid;

begin

if (select private.current_user_role())
   is distinct from 'admin' then
  raise exception 'Only administrators can update leases';
end if;

if p_actual_date > current_date then
  raise exception 'Termination date cannot be in the future';
end if;

if nullif(btrim(p_termination_reason), '') is null then
  raise exception 'Termination reason is required';
end if;

update public.leases
set
  actual_end_date = p_actual_date,
  status = 'terminated',
  termination_reason  = btrim(p_termination_reason)
where id = p_lease_id
  and status = 'active'
  and p_actual_date >= start_date
returning id into updated_lease_id;

if updated_lease_id is null then
  raise exception 'Lease is not active or termination date is invalid';
end if;

update public.rent_rates
set effective_to = p_actual_date
where lease_id = p_lease_id
  and effective_to is null
  and p_actual_date >= effective_from
returning id into updated_rent_id;

if updated_rent_id is null then
  raise exception 'No open rent rate found for this lease';
end if;

 return updated_lease_id;

end;
$$;

-- Grant specific access to this function
revoke execute
on function public.terminate_lease(
  uuid,
  date,
  text
)
from public;

grant execute
on function public.terminate_lease(
  uuid,
  date,
  text
)
to authenticated;

 
-- testing scripts
begin;

set local role authenticated;

set local request.jwt.claim.sub =
  '87fd7f9e-ddf3-4d76-a329-f6cc6e2cdd9e';


select public.terminate_lease(
  'f4dacc58-e58f-400d-be08-78298d969881'::uuid,
  date '2026-05-09' 
) as updated_lease_id;

/* Still inside SAME transaction */
select
  l.id,
  l.status,
  l.start_date,
  l.actual_end_date,
  l.termination_reason,
  rr.effective_from,
  rr.effective_to,
  rr.reason
from public.leases l
join public.rent_rates rr
  on rr.lease_id = l.id
where l.id = 'f4dacc58-e58f-400d-be08-78298d969881'
and rr.id = '3a9960f5-93d5-4fe5-b5ce-f9d56266e4ca';


--rollback




--public.increase_rent_rate
 create or replace function public.increase_rent_rate(
  p_lease_id uuid,
  p_effective_from date,
  p_monthly_rent numeric,
  p_reason text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  updated_rent_id uuid;
  inserted_rent_id uuid;
  prev_effective_to DATE;
  old_monthly_rent numeric;

begin

prev_effective_to := p_effective_from - 1;

if (select private.current_user_role())
   is distinct from 'admin' then
  raise exception 'Only administrators can update leases';
end if;

if not exists (
  select 1
  from public.leases
  where id = p_lease_id
    and status = 'active'
) then
  raise exception 'Only an active lease can have its rent increased';
end if;

if nullif(btrim(p_reason), '') is null then
  raise exception 'Reason for rent increase is required';
end if;

if p_effective_from > current_date then
  raise exception 'Rent increase effective date cannot be in the future';
end if;

Update public.rent_rates
set effective_to = prev_effective_to
Where lease_id = p_lease_id
AND effective_to is null
AND prev_effective_to >= effective_from
AND monthly_rent < p_monthly_rent  
returning id, monthly_rent into updated_rent_id, old_monthly_rent ;

if updated_rent_id is null then
  raise exception 'Unable to update rent record, either no active rent record exists or effective to date is set to before effective from, or the monthly rent is not increased';
end if;

Insert into public.rent_rates (lease_id, effective_from, monthly_rent, increase_percent, reason, created_by)
Values (p_lease_id, p_effective_from, p_monthly_rent, (((p_monthly_rent - old_monthly_rent) / old_monthly_rent) * 100 ), btrim(p_reason), (select auth.uid()))
returning id into inserted_rent_id;

if inserted_rent_id is null then
  raise exception 'Unable to enter rent record';
end if;

Update public.leases
set next_increase_date = (p_effective_from + (increase_interval_months * INTERVAL '1 month'))::date
where id = p_lease_id
And increase_interval_months is not null;

return inserted_rent_id;

end;
$$;

-- Grant specific access to this function
revoke execute
on function public.increase_rent_rate(
  uuid,
  date,
  numeric,
  text
)
from public;

grant execute
on function public.increase_rent_rate(
  uuid,
  date,
  numeric,
  text
)
to authenticated;


-- testing scripts
begin;

set local role authenticated;

set local request.jwt.claim.sub =
  '87fd7f9e-ddf3-4d76-a329-f6cc6e2cdd9e';


select public.increase_rent_rate(
  'f4dacc58-e58f-400d-be08-78298d969881'::uuid,
  '2026-10-01'::date,
  27500::numeric,
  'no reason'::text
) as inserted_lease_id;

/* Still inside SAME transaction */
select
  rr.effective_from,
  rr.effective_to,
  rr.monthly_rent,
  rr.increase_percent,
  rr.reason,
  ls.next_increase_date,
  ls.increase_interval_months
From  public.rent_rates rr
inner join leases ls on ls.id = rr.lease_id
where rr.lease_id = 'f4dacc58-e58f-400d-be08-78298d969881'
order by effective_from asc;


--rollback







