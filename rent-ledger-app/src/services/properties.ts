import { supabase } from "@/lib/supabase";
import { CreatePropertyInput, UpdatePropertyInput } from "@/types/property";

export async function getProperties() {
  const { data, error } = await supabase
    .from("properties")
    .select("id, name, address, notes, is_active, created_at")
    .order("name");

  if (error) {
    throw error;
  }

  return data;
}

//may return the property after insert
export async function createProperty(item: CreatePropertyInput) {
  const { data, error } = await supabase
    .from("properties")
    .insert({
      name: item.name,
      address: item.address,
      notes: item.notes,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

//may return the property after update
export async function updateProperty(id: string, item: UpdatePropertyInput) {
  const { data, error } = await supabase
    .from("properties")
    .update({ name: item.name, address: item.address, notes: item.notes })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function getProperty(id: string) {
  const { data, error } = await supabase
    .from("properties")
    .select("id, name, address, notes, is_active, created_at")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function setPropertyActive(id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from("properties")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}
