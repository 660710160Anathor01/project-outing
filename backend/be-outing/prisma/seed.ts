import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and fill it in before seeding.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/**
 * Destinations are upserted by their unique name so the seed can be re-run
 * safely without duplicating rows or clobbering edits made in the app.
 */
const destinations = [
  {
    name: 'Khao Yai',
    description:
      'Thailand’s first national park and a UNESCO World Heritage site — misty mountain viewpoints, waterfalls, vineyards and cool evenings just three hours from Bangkok.',
    imageUrl: '/images/destinations/khao-yai.jpg',
    startDate: new Date('2026-11-13T00:00:00.000Z'),
    endDate: new Date('2026-11-15T00:00:00.000Z'),
  },
];

async function main(): Promise<void> {
  for (const destination of destinations) {
    const location = await prisma.location.upsert({
      where: { name: destination.name },
      update: {
        description: destination.description,
        imageUrl: destination.imageUrl,
        startDate: destination.startDate,
        endDate: destination.endDate,
      },
      create: destination,
    });

    console.log(`Seeded destination: ${location.name} (${location.id})`);
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
