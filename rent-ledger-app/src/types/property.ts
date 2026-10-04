export type Property = {
  id: string;
  name: string;
  address: string | null; //address?: string property might not exist at all
  notes: string | null; // notes: string | null; column exists but database may contain NULL
  is_active: boolean;
  created_at: string;
};

export type CreatePropertyInput = {
  name: string;
  address: string | null;
  notes: string | null;
};

export type UpdatePropertyInput = {
  name: string;
  address: string | null;
  notes: string | null;
};
