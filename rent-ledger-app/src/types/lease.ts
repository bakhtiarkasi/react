import { Property } from "./property";
import { Tenant } from "./tenant";
import { Unit } from "./units";

export type LeaseStatus = "active" | "ended" | "terminated";

export type Lease = {
  id: string;
  unit_id: string;
  tenant_id: string;
  start_date: string;
  contract_end_date: string | null;
  actual_end_date: string | null;
  status: LeaseStatus;
  agreed_security_deposit: number;
  default_increase_percent: number | null;
  increase_interval_months: number | null;
  next_increase_date: string | null;
  notes: string | null;
  created_at: string;
};

export type RentRate = {
  id: string;
  lease_id: string;
  effective_from: string;
  effective_to: string | null;
  monthly_rent: number;
  increase_percent: number | null;
  reason: string | null;
  created_by: string | null;
  created_at: string;
};

export type CreateLeaseWithRentInput = {
  unit_id: string;
  tenant_id: string;
  start_date: string;
  contract_end_date: string | null;
  agreed_security_deposit: number;
  default_increase_percent: number | null;
  increase_interval_months: number | null;
  next_increase_date: string | null;
  initial_monthly_rent: number;
  notes: string | null;
};

export type LeaseWithRent = {
  id: string;
  start_date: string;
  status: LeaseStatus;

  tenants: Pick<Tenant, "full_name"> | null;

  units:
    | (Pick<Unit, "unit_type" | "unit_code"> & {
        properties: Pick<Property, "name"> | null;
      })
    | null;

  rent_rates: Pick<RentRate, "monthly_rent">[];
};

export type LeaseDetail = {
  id: string;
  start_date: string;
  contract_end_date: string | null;
  actual_end_date: string | null;
  status: LeaseStatus;

  agreed_security_deposit: number;
  default_increase_percent: number | null;
  increase_interval_months: number | null;
  next_increase_date: string | null;
  notes: string | null;
  termination_reason: string | null;

  tenants: Pick<Tenant, "full_name" | "phone"> | null;

  units:
    | (Pick<Unit, "unit_code" | "unit_type"> & {
        properties: Pick<Property, "name"> | null;
      })
    | null;

  rent_rates: Pick<
    RentRate,
    "id" | "monthly_rent" | "effective_from" | "effective_to"
  >[];
};

export const leaseOSOptions = [
  { label: "Active", value: "active" },
  { label: "Ended", value: "ended" },
  { label: "Terminated", value: "terminated" },
] satisfies {
  label: string;
  value: LeaseStatus;
}[];

export type RentHistory = Pick<
  RentRate,
  | "id"
  | "monthly_rent"
  | "effective_from"
  | "effective_to"
  | "increase_percent"
  | "reason"
>;
