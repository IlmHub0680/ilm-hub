import { prisma } from "./lib/prisma.js";

const hero = await prisma.homepageHero.findUnique({ where: { id: "default-homepage-hero" } });
const groups = await prisma.footerLinkGroup.findMany({ include: { links: true } });
console.log("HERO:", JSON.stringify(hero));
console.log("FOOTER GROUPS:", JSON.stringify(groups, null, 2));
await prisma.$disconnect();
