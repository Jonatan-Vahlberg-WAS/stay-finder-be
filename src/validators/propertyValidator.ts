import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const propertySchema = z.object({
  title: z.string().min(2, "Title is nececary"),
  description: z.string().min(3, "Description is nececary"),
  max_guests: z.number().min(1, "Max guests needs to be min 1"),
  price_per_night: z
    .number()
    .min(100, "Price per night needs to be a minimum of 100"),
  location: z.string().min(2, "Location is nececary"),
  property_id: z.string().optional(),
});

const propertyOptionalSchema = propertySchema.partial()

export const propertyValidator = zValidator("json", propertySchema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        errors: result.error.issues.map(issue => {
            return [issue.path.join(", "), issue.message]
        }),
      },
      400,
    );
  }
});

export const propertyOptionalValidator = zValidator("json", propertyOptionalSchema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        errors: result.error.issues.map(issue => {
            return [issue.path.join(", "), issue.message]
        }),
      },
      400,
    );
  }
});
