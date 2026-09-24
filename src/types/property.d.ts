interface Property {
  title: string;
  description: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  property_id: string
}

type NewProperty = Omit<Property, "property_id">