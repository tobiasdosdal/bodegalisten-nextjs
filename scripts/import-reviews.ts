import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Missing NEXT_PUBLIC_CONVEX_URL environment variable");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Reviews from SQL file (sml_reviews table)
const reviews = [
  {
    barName: "The Old Irish Pub",
    rating: 3,
    comment: "Ganske fint et sted med god musik!",
    smoking: 1,
    priceLevel: "2",
    userId: "Martin",
    createdAt: new Date("2024-02-21T11:21:15").getTime(),
  },
  {
    barName: "Aarhus Bryghus",
    rating: 4,
    comment: "Det er et bryghus, som også holder fredagsbar. Gode og forskellige øl",
    smoking: 0,
    priceLevel: "1",
    userId: "Allan",
    createdAt: new Date("2024-02-21T13:54:06").getTime(),
  },
  {
    barName: "Mucki Bar",
    rating: 5,
    comment: "Helt vildt hyggelig og god bodega! De er søde dernede, og der er god stemning. Det meste af året er der en masse borde ude foran, hvor man også kan sidde",
    smoking: 1,
    priceLevel: "2",
    userId: "Maria",
    createdAt: new Date("2024-02-22T17:09:33").getTime(),
  },
  {
    barName: "Karrusellen",
    rating: 5,
    comment: "God, du kan købe en spand. De spiller linkin park. De sælger vestfyen i spand før kl 20",
    smoking: 1,
    priceLevel: "1",
    userId: "Frederik",
    createdAt: new Date("2024-11-15T17:46:00").getTime(),
  },
  {
    barName: "Temple Bar",
    rating: 4,
    comment: "Har været der engang, det var fint :)",
    smoking: 0,
    priceLevel: "2",
    userId: "Frederik",
    createdAt: new Date("2024-11-22T12:33:31").getTime(),
  },
  {
    barName: "Hop House",
    rating: 5,
    comment: "Altid hyggeligt",
    smoking: undefined,
    priceLevel: undefined,
    userId: "Marcus",
    createdAt: new Date("2024-12-04T20:11:52").getTime(),
  },
  {
    barName: "The Jane",
    rating: 5,
    comment: "Stamstedet",
    smoking: undefined,
    priceLevel: undefined,
    userId: "Marcus",
    createdAt: new Date("2024-12-04T20:12:52").getTime(),
  },
];

async function importReviews() {
  console.log("Starting review import...\n");

  for (const review of reviews) {
    try {
      await client.mutation(api.reviews.importByBarName, review);
      console.log(`✓ Imported review for "${review.barName}" by ${review.userId}`);
    } catch (error) {
      console.error(`✗ Failed to import review for "${review.barName}":`, error);
    }
  }

  console.log("\nImport complete!");
}

importReviews();
