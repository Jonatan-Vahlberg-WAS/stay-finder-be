interface Property {
  title: string;
  description: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  property_id: string
  created_at: string
}

type NewProperty = Omit<Property, "property_id" | "created_at">

type PropertyKey = keyof Property