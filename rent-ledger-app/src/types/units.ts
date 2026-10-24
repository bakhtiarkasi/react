//create a union type that matches your PostgreSQL check constraint
export type UnitType =
  | "shop"
  | "flat"
  | "shed"
  | "basement"
  | "service_station"
  | "warehouse"
  | "other";

// Make sure your options array matches your union type items exactly
export const unitTypeOptions = [
  { label: "Shop", value: "shop" },
  { label: "Flat", value: "flat" },
  { label: "Shed", value: "shed" },
  { label: "Basement", value: "basement" },
  { label: "Service Station", value: "service_station" },
  { label: "Warehouse", value: "warehouse" },
  { label: "Other", value: "other" },
] satisfies {
  label: string;
  value: UnitType;
}[];

export type UnitOperationalStatus =
  | "active"
  | "inactive"
  | "under_maintenance"
  | "not_rentable";

export const unitOSOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  {
    label: "Under Maintenance",
    value: "under_maintenance",
  },
  {
    label: "Not Rentable",
    value: "not_rentable",
  },
] satisfies {
  label: string;
  value: UnitOperationalStatus;
}[];

export type Unit = {
  id: string;
  property_id: string;
  unit_code: string;
  unit_type: UnitType;
  description: string | null;
  operational_status: UnitOperationalStatus;
  created_at: string;
};

export type CreateUnitInput = {
  property_id: string;
  unit_code: string;
  unit_type: UnitType;
  description: string | null;
};

export type UpdateUnitInput = {
  unit_code: string;
  unit_type: UnitType;
  description: string | null;
  operational_status: UnitOperationalStatus;
};

export type AvailableUnitType = Pick<
  Unit,
  "id" | "property_id" | "unit_code" | "unit_type"
>;
