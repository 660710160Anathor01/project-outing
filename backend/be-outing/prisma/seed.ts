import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and fill it in before seeding.",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const LOCATIONS = [
  {
    name: "Thann Pool Villa",
    description:
      "A private luxury pool villa surrounded by nature, offering panoramic sunset and Phaya Yen mountain views.",
    address: "Pak Chong, Nakhon Ratchasima, Thailand",
    beds: 4,
    residentCapacity: 8,
    carparkCapacity: 3,
    imageUrl: ["https://chillpainai.com/storage/scoop/14639/3.jpg"],
  },
  {
    name: "The Scandic Khao Yai",
    description:
      "The Scandic Khao Yai offers a cozy Scandinavian-style stay surrounded by the beautiful mountains of Khao Yai.",
    address: "Mu Si, Pak Chong, Nakhon Ratchasima, Thailand",
    beds: 3,
    residentCapacity: 6,
    carparkCapacity: 2,
    imageUrl: [
      "https://www.chillpainai.com/src/wewakeup/scoop/images/e8e4b47de657ffbe94b9874e17952b3e3af26a4b.jpg",
    ],
  },
  {
    name: "La Vallee Khaoyai",
    description:
      "La Vallee Khaoyai offers a modern private villa with a relaxed atmosphere, featuring 3 bedrooms, a private pool with jacuzzi, living room, and fully equipped kitchen.",
    address: "Khao Yai, Pak Chong, Nakhon Ratchasima, Thailand",
    beds: 3,
    residentCapacity: 6,
    carparkCapacity: 2,
    imageUrl: [
      "https://www.chillpainai.com/src/wewakeup/scoop/images/f7d5b3e5fc308afd8ea685b454bc288760cb648b.jpg",
    ],
  },
];

async function main(): Promise<void> {
  for (const location of LOCATIONS) {
    const result = await prisma.location.upsert({
      where: {
        name: location.name,
      },
      update: {
        description: location.description,
        address: location.address,
        beds: location.beds,
        residentCapacity: location.residentCapacity,
        carparkCapacity: location.carparkCapacity,
        imageUrl: location.imageUrl,
      },
      create: {
        name: location.name,
        description: location.description,
        address: location.address,
        beds: location.beds,
        residentCapacity: location.residentCapacity,
        carparkCapacity: location.carparkCapacity,
        imageUrl: location.imageUrl,
      },
    });

    console.log(`Seeded location: ${result.name} (${result.id})`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
