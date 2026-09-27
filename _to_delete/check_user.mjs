import { prisma } from '../lib/prisma.js';

const email = process.argv[2];
if (!email) {
  console.log('Usage: node check_user.mjs <email>');
  process.exit(1);
}

const user = await prisma.user.findUnique({
  where: { email: email.trim().toLowerCase() },
  select: { id: true, email: true, name: true, role: true, passwordHash: true, createdAt: true },
});

if (!user) {
  console.log('NO USER FOUND with email:', email.trim().toLowerCase());
} else {
  console.log('USER FOUND:');
  console.log('  id:', user.id);
  console.log('  email:', user.email);
  console.log('  name:', user.name);
  console.log('  role:', user.role);
  console.log('  passwordHash present:', !!user.passwordHash, '(length:', user.passwordHash?.length, ')');
  console.log('  passwordHash starts with $2:', user.passwordHash?.startsWith('$2'));
  console.log('  createdAt:', user.createdAt);
}

await prisma.$disconnect();
