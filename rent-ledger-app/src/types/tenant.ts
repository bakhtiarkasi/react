export type Tenant = {
  id: string;
  full_name: string;
  father_name: string | null;
  cnic: string | null;
  phone: string | null;
  alternate_phone: string | null;
  permanent_address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

export type CreateTenantInput = {
  full_name: string;
  father_name: string | null;
  cnic: string | null;
  phone: string | null;
  alternate_phone: string | null;
  permanent_address: string | null;
  notes: string | null;
};

export type UpdateTenantInput = {
  full_name: string;
  father_name: string | null;
  cnic: string | null;
  phone: string | null;
  alternate_phone: string | null;
  permanent_address: string | null;
  notes: string | null;
};
