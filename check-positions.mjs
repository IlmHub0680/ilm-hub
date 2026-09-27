import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const positions = await prisma.position.findMany({
  orderBy: { nameEn: "asc" },
  select: { id: true, code: true, nameEn: true, isAcademic: true },
});

console.log(JSON.stringify(positions, null, 2));

await prisma.$disconnect();
