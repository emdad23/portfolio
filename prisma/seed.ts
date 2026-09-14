// Entry point for `npm run db:seed`. Each table has its own seeder in ./seeds;
// this file only opens the connection and runs them in order.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { seedBlogPosts } from "./seeds/blog-posts";
import { seedSkills } from "./seeds/skills";
import { seedExperiences } from "./seeds/experiences";
import { seedSettings } from "./seeds/settings";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await seedBlogPosts(prisma);
  await seedSkills(prisma);
  await seedExperiences(prisma);
  await seedSettings(prisma);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
