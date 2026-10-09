import { supabase } from "@/lib/supabase";
import { CreateUnitInput, UpdateUnitInput } from "@/types/units";

// returns only the ones who matches the foreign key : .eq("property_id", propertyId)
export async function getUnitsByProperty(propertyId: string) {
  const { data, error } = await supabase
    .from("units")
    .select(
      "id, property_id, unit_code, unit_type, description, operational_status, created_at",
    )
    .eq("property_id", propertyId)
    .order("unit_code");

  if (error) {
    throw error;
  }
  return data;
}

//may return the property after insert
export async function createUnit(item: CreateUnitInput) {
  const { data, error } = await supabase
    .from("units")
    .insert({
      property_id: item.property_id,
      unit_code: item.unit_code,
      unit_type: item.unit_type,
      description: item.description,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

//may return the property after update
export async function updateUnit(
  id: string,
  propertyId: string,
  item: UpdateUnitInput,
) {
  const { data, error } = await supabase
    .from("units")
    .update({
      unit_code: item.unit_code,
      unit_type: item.unit_type,
      operational_status: item.operational_status,
      description: item.description,
    })
    .eq("id", id)
    .eq("property_id", propertyId)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function getUnit(id: string, propertyId: string) {
  const { data, error } = await supabase
    .from("units")
    .select(
      "id, property_id, unit_code, unit_type, description, operational_status, created_at",
    )
    .eq("id", id)
    .eq("property_id", propertyId)
    .single();

  if (error) {
    throw error;
  }
  return data;
}
