type PropertyKind = "apartment" | "villa";

interface Property {
  title: string;
  description: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  property_id: string
  kind: PropertyKind;
  created_at: string
}

type NewProperty = Omit<Property, "property_id" | "created_at">

type PropertyValidKey = keyof Property