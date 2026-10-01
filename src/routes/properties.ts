import { Hono } from "hono";

import {
  propertyOptionalValidator,
  propertyValidator,
} from "../validators/propertyValidator.js";
import {
  createProperty,
  deletePropertyById,
  getProperties,
  getPropertyById,
  updatePropertyById,
} from "../database/properties.js";

const properties = new Hono({ strict: false });

properties.get("/", async (c) => {
  try {
    const properties = await getProperties({
      maxPrice: Number(c.req.query("maxprice")) || undefined,
      location: c.req.query("location"),
      maxGuests: Number(c.req.query("maxguests")) || undefined,
    });
    return c.json(properties);
  } catch (e) {
    console.warn("Error in fetching properties from SB database", e);
    return c.json([]);
  }
});

// individuell GET hämta en Property om den finns baserat på ID annars null 404
properties.get("/:id", async (c) => {
  const propertyId = c.req.param("id");
  try {
    const property = await getPropertyById(propertyId);
    return c.json(property);
  } catch (e) {
    console.warn("Error in fetching property from SB database", e);
    return c.json(null, 404);
  }
});

// "Skpande" av en Propery POST genom en JSON body använd Postman eller thunderclient för detta
properties.post("/", propertyValidator, async (c) => {
  const propertyBody: NewProperty = c.req.valid("json");
  try {
    const property = await createProperty(propertyBody);
    return c.json(property, 201);
  } catch (e) {
    console.warn("error in inserting property into SB DB", e);
    return c.json(e, 500);
  }
});

// Extra: "Updaterande" av en Property PUT/PATCH (för patch kolla Partial types)
// om den finns tänk en blandning mellan GET + POST
properties.patch("/:id", propertyOptionalValidator, async (c) => {
  const propertyId = c.req.param("id");
  const propertyBody: Partial<Property> = c.req.valid("json");
  try {
    const property = await updatePropertyById(propertyId, propertyBody);
    return c.json(property);
  } catch (e) {
    console.log("Error updating property in SB DB", e);
    return c.json(null, 404);
  }
});

// Extra: "bortagning" av en Property DELETE om den finns tänk en GET som sedan tar bort 200/204
properties.delete("/:id", async (c) => {
  const propertyId = c.req.param("id");
  try {
    await deletePropertyById(propertyId);
    return c.json(null, 200);
  } catch (e) {
    console.warn("Error in deleting property", e);
    return c.json(null, 404);
  }
});
export default properties;
