import type { PostgrestSingleResponse } from "@supabase/supabase-js";

import { sb } from "../lib/supabase.js";

const TABLE_NAME = "properties";

const SELECT_QUERY_LIST: PropertyValidKey[] = [
  "property_id",
  "title",
  "description",
  "location",
  "price_per_night",
  "max_guests",
  "created_at",
];

const SELECT_QUERY = SELECT_QUERY_LIST.join(", ");
const QUERY_ID = "property_id";

type PropertyListFilter = Partial<{
  maxPrice: number;
  location: string;
  maxGuests: number;
}>;

export async function getProperties(
  filters: PropertyListFilter,
): Promise<Property[]> {
  let query = sb.from(TABLE_NAME).select(SELECT_QUERY);

  if (filters.maxPrice) {
    query = query.lte("price_per_night", filters.maxPrice);
  }

  if (filters.maxGuests) {
    query = query.lte("max_guests", filters.maxGuests);
  }

  if(filters.location && filters.location.trim().length > 2 ) {
    query = query.ilike("location", `%${filters.location}%`)
  }

  const { error, data } = await query;

  if (!error) {
    return data as any as Property[];
  }
  throw error;
}

export async function getPropertyById(propertyId: string): Promise<Property> {
  const { error, data }: PostgrestSingleResponse<Property> = await sb
    .from(TABLE_NAME)
    .select(SELECT_QUERY)
    .eq(QUERY_ID, propertyId)
    .single();

  if (!error) {
    return data;
  }
  throw error;
}

export async function createProperty(propertyBody: NewProperty) {
  const { error, data }: PostgrestSingleResponse<Property> = await sb
    .from(TABLE_NAME)
    .insert(propertyBody)
    .select(SELECT_QUERY)
    .single();

  if (!error) {
    return data;
  }
  throw error;
}

export async function updatePropertyById(
  propertyId: string,
  property: Partial<Property>,
): Promise<Property> {
  const { error, data }: PostgrestSingleResponse<Property> = await sb
    .from(TABLE_NAME)
    .update(property)
    .eq(QUERY_ID, propertyId)
    .select()
    .single();

  if (!error) {
    return data;
  }
  throw error;
}

export async function deletePropertyById(propertyId: string) {
  const { error }: PostgrestSingleResponse<Property> = await sb
    .from(TABLE_NAME)
    .delete()
    .eq(QUERY_ID, propertyId)
    .select()
    .single();

  if (!error) {
    return;
  }
  throw error;
}
