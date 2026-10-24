import { supabase } from "@/lib/supabase";
import {
  CreateLeaseWithRentInput,
  LeaseDetail,
  LeaseWithRent,
  RentHistory,
} from "@/types/lease";

export async function getAvailableUnitsByProperty(propertyId: string) {
  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("id, property_id, unit_code, unit_type")
    .eq("property_id", propertyId)
    .eq("operational_status", "active")
    .order("unit_code");

  if (unitsError) {
    throw unitsError;
  }

  if (units.length === 0) {
    return [];
  }

  //get property specific units only
  const unitIds = units.map((unit) => unit.id);

  const { data: activeLeases, error: leasesError } = await supabase
    .from("leases")
    .select("unit_id")
    .eq("status", "active")
    .in("unit_id", unitIds);

  if (leasesError) {
    throw leasesError;
  }

  const occupiedUnitIds = new Set(activeLeases.map((lease) => lease.unit_id));

  return units.filter((unit) => !occupiedUnitIds.has(unit.id));
}

export async function createLeaseWithInitialRent(
  input: CreateLeaseWithRentInput,
) {
  const { data, error } = await supabase.rpc("create_lease_with_initial_rent", {
    p_unit_id: input.unit_id,
    p_tenant_id: input.tenant_id,
    p_start_date: input.start_date,
    p_contract_end_date: input.contract_end_date,
    p_security_deposit: input.agreed_security_deposit,
    p_increase_percent: input.default_increase_percent,
    p_increase_interval_months: input.increase_interval_months,
    p_next_increase_date: input.next_increase_date,
    p_initial_monthly_rent: input.initial_monthly_rent,
    p_notes: input.notes,
  });

  if (error) {
    throw error;
  }
  return data;
}

export async function getLeases(): Promise<LeaseWithRent[]> {
  const { data, error } = await supabase
    .from("leases")
    .select(
      `
      id,
      start_date,
      status,

      tenants (
        full_name
      ),

      units (
        unit_type,
        unit_code,

        properties (
          name
        )
      ),

      rent_rates (
        monthly_rent
      )
    `,
    )
    .order("effective_to", {
      referencedTable: "rent_rates",
      ascending: false,
      nullsFirst: true,
    })
    .order("effective_from", {
      referencedTable: "rent_rates",
      ascending: false,
    })
    .limit(1, { referencedTable: "rent_rates" });

  if (error) {
    throw error;
  }

  return data as unknown as LeaseWithRent[];
}

export async function getLease(leaseId: string): Promise<LeaseDetail> {
  const { data, error } = await supabase
    .from("leases")
    .select(
      `
    id,
    start_date,
    contract_end_date,
    actual_end_date,
    status,

    agreed_security_deposit,
    default_increase_percent,
    increase_interval_months,
    next_increase_date,
    notes,
    termination_reason,
    
   
    units!inner  (
      unit_code,
      unit_type,
      properties!inner(
      name)
    ),

    tenants!inner(
    full_name,
    phone),
    
    rent_rates!inner  (
      id,
      monthly_rent,
      effective_from,
      effective_to
    )
  `,
    )
    .eq("id", leaseId)
    .order("effective_to", {
      referencedTable: "rent_rates",
      ascending: false,
      nullsFirst: true,
    })
    .order("effective_from", {
      referencedTable: "rent_rates",
      ascending: false,
    })
    .limit(1, { referencedTable: "rent_rates" })
    .single();

  //!inner  is for inner join

  if (error) {
    throw error;
  }

  return data as unknown as LeaseDetail;
}

export async function endLease(leaseId: string, actualEndDate: string) {
  const { data, error } = await supabase.rpc("end_lease", {
    p_lease_id: leaseId,
    p_actual_date: actualEndDate,
  });

  if (error) {
    throw error;
  }
  return data;
}

export async function terminateLease(
  leaseId: string,
  actualEndDate: string,
  terminationReason: string,
) {
  const { data, error } = await supabase.rpc("terminate_lease", {
    p_lease_id: leaseId,
    p_actual_date: actualEndDate,
    p_termination_reason: terminationReason,
  });

  if (error) {
    throw error;
  }
  return data;
}

export async function increaseRentRate(
  leaseId: string,
  effectiveFromDate: string,
  monthlyRent: number,
  reason: string,
) {
  const { data, error } = await supabase.rpc("increase_rent_rate", {
    p_lease_id: leaseId,
    p_effective_from: effectiveFromDate,
    p_monthly_rent: monthlyRent,
    p_reason: reason,
  });

  if (error) {
    throw error;
  }
  return data;
}

export async function getRentHistory(leaseId: string): Promise<RentHistory[]> {
  const { data, error } = await supabase
    .from("rent_rates")
    .select(
      `
      id,
      monthly_rent,
      effective_from,
      effective_to,
      increase_percent,
      reason
      `,
    )
    .eq("lease_id", leaseId)
    .order("effective_from", {
      ascending: true,
      nullsFirst: false,
    });
  if (error) {
    throw error;
  }
  return data as unknown as RentHistory[];
}
