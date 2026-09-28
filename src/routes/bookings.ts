import { Hono } from "hono";
import {
  bookingOptionalValidator,
  bookingValidator,
} from "../validators/bookingValidator.js";
import fs from "fs/promises";

const bookings = new Hono({ strict: false });

async function getBookings(): Promise<Booking[]> {
  try {
    const data = await fs.readFile("src/data/bookings.json", {
      encoding: "utf8",
    });
    const bookings: Booking[] = JSON.parse(data);
    return bookings;
  } catch (e) {
    console.warn("Error getting bookings from json", e);
    return [];
  }
}

async function saveBookings(bookings: Booking[]): Promise<void> {
  try {
    const data = JSON.stringify(bookings, null, 2);
    await fs.writeFile("src/data/bookings.json", data, {
      encoding: "utf-8",
    });
    return;
  } catch (e) {
    console.warn("Error writing bookings to json file", e);
    throw Error("Error writing bookings to json file");
  }
}

bookings.get("/", async (c) => {
  try {
    const bookings = await getBookings();
    return c.json(bookings);
  } catch (e) {
    console.warn("Error getting bookings", e);
    return c.json([]);
  }
});

// individuell GET hämta en Booking om den finns baserat på ID annars null 404
bookings.get("/:id", async (c) => {
  const bookings = await getBookings();
  const bookingId = c.req.param("id");
  const booking = bookings.find((booking) => booking.booking_id === bookingId);
  if (!booking) {
    return c.json(null, 404);
  }
  return c.json(booking);
});

// "Skpande" av en Propery POST genom en JSON body använd Postman eller thunderclient för detta
bookings.post("/", bookingValidator, async (c) => {
  const bookingBody: NewBooking = c.req.valid("json");
  const bookings = await getBookings();
  const booking: Booking = {
    ...bookingBody,
    booking_id: `booking_${1000 + bookings.length + 1}`,
  };
  bookings.push(booking);
  try {
    await saveBookings(bookings);
  } catch (e) {
    return c.json(e, 500);
  }
  return c.json(booking, 201);
});

// Extra: "Updaterande" av en Booking PUT/PATCH (för patch kolla Partial types)
// om den finns tänk en blandning mellan GET + POST
bookings.patch("/:id", bookingOptionalValidator, async (c) => {
  const bookingId = c.req.param("id");
  const bookings = await getBookings();
  const bookingIndex = bookings.findIndex(
    (booking) => booking.booking_id === bookingId,
  );

  if (bookingIndex === -1) {
    return c.json(null, 404);
  }

  const bookingBody: Partial<NewBooking> = c.req.valid("json");
  const updatedBooking = {
    ...bookings[bookingIndex],
    ...bookingBody,
  } as Booking;
  bookings[bookingIndex] = updatedBooking;
  try {
    await saveBookings(bookings);
    return c.json(updatedBooking);
  } catch (e) {
    return c.json(e, 500);
  }
});

// Extra: "bortagning" av en Booking DELETE om den finns tänk en GET som sedan tar bort 200/204
  bookings.delete("/:id", async (c) => {
  const bookingId = c.req.param("id");
  const bookings = await getBookings();
  const bookingIndex = bookings.findIndex(
    (booking) => booking.booking_id === bookingId,
  );
  if (bookingIndex === -1) {
    return c.json(null, 404);
  }
  bookings.splice(bookingIndex, 1);
  try {
    await saveBookings(bookings);
    return c.json(null, 200);
  } catch (e) {
    return c.json(e, 500);
  }
});
export default bookings;
