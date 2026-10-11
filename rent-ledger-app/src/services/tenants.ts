import { supabase } from "@/lib/supabase";
import { CreateTenantInput, UpdateTenantInput } from "@/types/tenant";

export async function getTenants() {
  const { data, error } = await supabase
    .from("tenants")
    .select(
      "id, full_name, father_name, cnic, phone, alternate_phone, permanent_address, notes, is_active, created_at",
    )
    .order("full_name");

  if (error) {
    throw error;
  }

  return data;
}

//may return the tenant after insert
export async function createTenant(item: CreateTenantInput) {
  const { data, error } = await supabase
    .from("tenants")
    .insert({
      full_name: item.full_name,
      father_name: item.father_name,
      cnic: item.cnic,
      phone: item.phone,
      alternate_phone: item.alternate_phone,
      permanent_address: item.permanent_address,
      notes: item.notes,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

//may return the tenant after update
export async function updateTenant(id: string, item: UpdateTenantInput) {
  const { data, error } = await supabase
    .from("tenants")
    .update({
      full_name: item.full_name,
      father_name: item.father_name,
      cnic: item.cnic,
      phone: item.phone,
      alternate_phone: item.alternate_phone,
      permanent_address: item.permanent_address,
      notes: item.notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function getTenant(id: string) {
  const { data, error } = await supabase
    .from("tenants")
    .select(
      "id, full_name, father_name, cnic, phone, alternate_phone, permanent_address, notes, is_active, created_at",
    )
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function setTenantActive(id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from("tenants")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}
