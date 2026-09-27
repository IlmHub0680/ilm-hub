import prisma from "../lib/prisma.js";

try {
  console.log("\n=== POSITIONS & PERMISSIONS ===");

  const positions = await prisma.position.findMany({
    orderBy: { nameEn: "asc" },
    include: {
      permissions: {
        orderBy: { module: "asc" },
      },
    },
  });

  for (const position of positions) {
    console.log(`\n${position.nameEn} (${position.id})`);

    if (!position.permissions.length) {
      console.log("  NO PERMISSIONS");
      continue;
    }

    for (const permission of position.permissions) {
      console.log(
        `  ${permission.module}: view=${permission.canView} edit=${permission.canEdit}`
      );
    }
  }

  console.log("\n=== STAFF ACCOUNTS ===");

  const staff = await prisma.staffProfile.findMany({
    orderBy: {
      user: {
        name: "asc",
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
      position: {
        select: {
          nameEn: true,
        },
      },
      faculty: {
        select: {
          nameEn: true,
        },
      },
      department: {
        select: {
          nameEn: true,
        },
      },
    },
  });

  for (const item of staff) {
    console.log(
      [
        item.user.name,
        item.user.email,
        `role=${item.user.role}`,
        `active=${item.isActive}`,
        `position=${item.position.nameEn}`,
        `faculty=${item.faculty?.nameEn ?? "-"}`,
        `department=${item.department?.nameEn ?? "-"}`,
      ].join(" | ")
    );
  }

  console.log("\n=== USER ROLES ===");

  const users = await prisma.user.findMany({
    select: {
      name: true,
      email: true,
      role: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  for (const user of users) {
    console.log(
      `${user.name} | ${user.email} | role=${user.role}`
    );
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
