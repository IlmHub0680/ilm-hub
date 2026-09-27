import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

try {
  console.log("Querying via PrismaClient + PrismaPg adapter...");
  const result = await prisma.$queryRaw`SELECT 1 as ok`;
  console.log("QUERY RESULT:", result);
} catch (err) {
  console.log("CAUGHT ERROR:");
  console.log("  message:", err.message);
  console.log("  name:", err.name);
  console.log("  code:", err.code);
} finally {
  await prisma.$disconnect();
  console.log("DONE");
}
