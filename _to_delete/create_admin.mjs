import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const email = process.argv[2];
const name = process.argv[3] || 'Administrator';
const password = process.argv[4];

if (!email || !password) {
  console.log('Usage: node create_admin.mjs <email> "<Full Name>" <password>');
  process.exit(1);
}

const normalizedEmail = email.trim().toLowerCase();

const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
if (existing) {
  console.log('A user with this email already exists:', normalizedEmail);
  console.log('  role:', existing.role);
  console.log('If you want to reset their password instead, say so and I will do that separately.');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);
const now = new Date();

const user = await prisma.user.create({
  data: {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'SUPER_ADMIN',
    authorStatus: 'PENDING',
    updatedAt: now,
  },
  select: { id: true, name: true, email: true, role: true, createdAt: true },
});

console.log('SUPER_ADMIN account created:');
console.log('  id:', user.id);
console.log('  email:', user.email);
console.log('  name:', user.name);
console.log('  role:', user.role);

await prisma.$disconnect();
