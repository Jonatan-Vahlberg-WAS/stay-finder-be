import { Hono } from "hono";
import {
  propertyOptionalValidator,
  propertyValidator,
} from "../validators/propertyValidator.js";
import fs from "fs/promises";
import { sb } from "../lib/supabase.js";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

const properties = new Hono({ strict: false });

async function getProperties(): Promise<Property[]> {
  try {
    const data = await fs.readFile("src/data/properties.json", {
      encoding: "utf8",
    });
    const properties: Property[] = JSON.parse(data);
    return properties;
  } catch (e) {
    console.warn("Error getting properties from json", e);
    return [];
  }
}

async function saveProperties(properties: Property[]): Promise<void> {
  try {
    const data = JSON.stringify(properties, null, 2);
    await fs.writeFile("src/data/properties.json", data, {
      encoding: "utf-8",
    });
    return;
  } catch (e) {
    console.warn("Error writing properties to json file", e);
    throw Error("Error writing properties to json file");
  }
}

properties.get("/", async (c) => {
  try {
    const { error, data }: PostgrestSingleResponse<Property[]> = await sb
      .from("properties")
      .select("*");
    if (!error) {
      return c.json(data);
    }
    throw error;
  } catch (e) {
    console.warn("Error in fetching properties from SB database", e);
    return c.json([]);
  }
});

// individuell GET hämta en Property om den finns baserat på ID annars null 404
properties.get("/:id", async (c) => {
  try {
    const { error, data }: PostgrestSingleResponse<Property> = await sb
      .from("properties")
      .select("*")
      .eq("property_id", c.req.param("id"))
      .single();
    console.log("error", error);
    console.log("data", data);
    if (!error) {
      return c.json(data);
    }
    throw error;
  } catch (e) {
    console.warn("Error in fetching property from SB database", e);
    return c.json(null, 404);
  }
});

// "Skpande" av en Propery POST genom en JSON body använd Postman eller thunderclient för detta
properties.post("/", propertyValidator, async (c) => {
  const propertyBody: NewProperty = c.req.valid("json");
  try {
    
    const { error, data }: PostgrestSingleResponse<Property> = await sb
      .from("properties")
      .insert([propertyBody])
      .select("*")
      .single();

    if (!error) {
      return c.json(data, 201);
    }
    throw error;
  } catch (e) {
    console.warn("error in inserting property into SB DB", e);
    return c.json(e, 500);
  }
});

// Extra: "Updaterande" av en Property PUT/PATCH (för patch kolla Partial types)
// om den finns tänk en blandning mellan GET + POST
properties.patch("/:id", propertyOptionalValidator, async (c) => {
  const propertyId = c.req.param("id");
  const properties = await getProperties();
  const propertyIndex = properties.findIndex(
    (property) => property.property_id === propertyId,
  );

  if (propertyIndex === -1) {
    return c.json(null, 404);
  }

  const propertyBody: Partial<Property> = c.req.valid("json");
  properties[propertyIndex] = {
    ...properties[propertyIndex],
    property_id: properties[propertyIndex].property_id,
    ...propertyBody,
  } as Property;
  try {
    await saveProperties(properties);
  } catch (e) {
    return c.json(e, 500);
  }
  return c.json(properties[propertyIndex]);
});

// Extra: "bortagning" av en Property DELETE om den finns tänk en GET som sedan tar bort 200/204
properties.delete("/:id", async (c) => {
  const propertyId = c.req.param("id");
  const properties = await getProperties();
  const propertyIndex = properties.findIndex(
    (property) => property.property_id === propertyId,
  );
  if (propertyIndex === -1) {
    return c.json(null, 404);
  }
  properties.splice(propertyIndex, 1);
  try {
    await saveProperties(properties);
  } catch (e) {
    return c.json(e, 500);
  }
  return c.json(null, 200);
});
export default properties;
