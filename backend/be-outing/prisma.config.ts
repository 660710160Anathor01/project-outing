import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Pooled Neon URL for queries. Migrations use DIRECT_URL (no PgBouncer).
    url: process.env['DATABASE_URL'],
    directUrl: process.env['DIRECT_URL'],
  },
});
