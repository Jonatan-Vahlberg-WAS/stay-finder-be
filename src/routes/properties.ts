import { Hono } from "hono";
import {
  propertyOptionalValidator,
  propertyValidator,
} from "../validators/propertyValidator.js";
import fs from "fs/promises";

const properties = new Hono({ strict: false });

const dummyProperties: Property[] = [
  {
    property_id: "property_1001",
    title: "Cozy Studio in Södermalm",
    description:
      "A bright and cozy studio apartment close to cafés, parks and public transport.",
    location: "Stockholm, Sweden",
    price_per_night: 850,
    max_guests: 2,
  },
  {
    property_id: "property_1002",
    title: "Modern Loft by the Harbor",
    description:
      "Spacious loft with harbor views, perfect for couples or small families.",
    location: "Gothenburg, Sweden",
    price_per_night: 1200,
    max_guests: 4,
  },
  {
    property_id: "property_1003",
    title: "Countryside Cabin",
    description:
      "A peaceful wooden cabin surrounded by forest, ideal for a quiet getaway.",
    location: "Dalarna, Sweden",
    price_per_night: 650,
    max_guests: 6,
  },
  {
    property_id: "property_1004",
    title: "City Center Apartment",
    description:
      "Newly renovated apartment right in the heart of the city, walking distance to everything.",
    location: "Malmö, Sweden",
    price_per_night: 950,
    max_guests: 3,
  },
];

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

async function saveProperties(properties: Property[] ): Promise<void> {
  try {
    const data = JSON.stringify(properties, null, 2)
    await fs.writeFile("src/data/properties.json", data, {
      encoding: "utf-8"
    });
    return
  } catch (e) {
    console.warn("Error writing properties to json file", e)
    throw Error("Error writing properties to json file");
  }
}

properties.get("/", async (c) => {
  const properties = await getProperties();
  return c.json(properties);
});

// individuell GET hämta en Property om den finns baserat på ID annars null 404
properties.get("/:id", async (c) => {
  const properties = await getProperties();
  const propertyId = c.req.param("id");
  const property = properties.find(
    (property) => property.property_id === propertyId,
  );
  if (!property) {
    return c.json(null, 404);
  }
  return c.json(property);
});

// "Skpande" av en Propery POST genom en JSON body använd Postman eller thunderclient för detta
properties.post("/", propertyValidator, async (c) => {
  const propertyBody: NewProperty = c.req.valid("json");
  const property: Property = {
    ...propertyBody,
    property_id: `property_${1000 + dummyProperties.length + 1}`,
  };
  const properties = await getProperties()
  properties.push(property)
  try {
    await saveProperties(properties)
  } catch (e) {
    return c.json(e, 500)
  }
  return c.json(property, 201);
});

// Extra: "Updaterande" av en Property PUT/PATCH (för patch kolla Partial types)
// om den finns tänk en blandning mellan GET + POST
properties.patch("/:id", propertyOptionalValidator, async (c) => {
  const propertyId = c.req.param("id");
  const propertyIndex = dummyProperties.findIndex(
    (property) => property.property_id === propertyId,
  );

  if (propertyIndex === -1) {
    return c.json(null, 404);
  }

  const propertyBody: Partial<Property> = c.req.valid("json");
  dummyProperties[propertyIndex] = {
    ...dummyProperties[propertyIndex],
    property_id: dummyProperties[propertyIndex].property_id,
    ...propertyBody,
  };

  return c.json(dummyProperties[propertyIndex]);
});

// Extra: "bortagning" av en Property DELETE om den finns tänk en GET som sedan tar bort 200/204
properties.delete("/:id", (c) => {
  const propertyId = c.req.param("id");
  const propertyIndex = dummyProperties.findIndex(
    (property) => property.property_id === propertyId,
  );
  if (propertyIndex === -1) {
    return c.json(null, 404);
  }
  dummyProperties.splice(propertyIndex, 1);
  return c.json(null, 200);
});
export default properties;
