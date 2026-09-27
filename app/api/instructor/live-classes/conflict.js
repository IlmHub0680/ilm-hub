import { prisma } from '@/lib/prisma';

// Conflict detection (Model 22): an instructor cannot be in two places at
// once. Checks for any existing LiveClass by the SAME instructor whose
// [scheduledAt, scheduledAt + durationMin) window overlaps the requested
// one. excludeId lets an update ignore the row being edited.
export async function findInstructorLiveClassConflict(instructorId, scheduledAt, durationMin, excludeId) {
  const windowStart = new Date(scheduledAt);
  const windowEnd = new Date(windowStart.getTime() + durationMin * 60000);

  const candidates = await prisma.liveClass.findMany({
    where: {
      instructorId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      // Cheap pre-filter (a day of slack either side); the precise
      // per-row window check below is what actually decides overlap.
      scheduledAt: {
        gte: new Date(windowStart.getTime() - 24 * 60 * 60000),
        lt: windowEnd,
      },
    },
    include: { course: { select: { titleEn: true } } },
  });

  for (const existing of candidates) {
    const existingStart = new Date(existing.scheduledAt);
    const existingEnd = new Date(existingStart.getTime() + existing.durationMin * 60000);

    if (windowStart < existingEnd && existingStart < windowEnd) {
      return existing;
    }
  }

  return null;
}
