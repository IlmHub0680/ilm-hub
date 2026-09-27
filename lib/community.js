import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PAGES } from "@/lib/legalContentDefaults";

// Shared permission/visibility helpers for the Ulul Azm Community
// (Model 25). Moved here out of app/api/community/posts/route.js so
// the new blocking/reporting/profile routes reuse the exact same
// "who can post / who moderates" logic instead of a second copy —
// unchanged from what already worked, just given one home.

export async function communityCanPost(user) {
  if (!user) return false;
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return true;
  if (user.role === "STUDENT") {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    return Boolean(profile);
  }
  const staff = await prisma.staffProfile.findUnique({
    where: { userId: user.id },
    include: { position: { include: { permissions: true } } },
  });
  if (!staff || !staff.isActive) return false;
  const perm = staff.position.permissions.find((p) => p.module === "STUDENT_MATTERS");
  return Boolean(perm?.canEdit);
}

export async function communityIsModerator(user) {
  return communityCanPost(user); // same real permission set the feature already used
}

// True when either side has blocked the other -- a block is
// one-directional to create (A can block B without B's consent), but
// its effect on visibility/interaction must be checked both ways so a
// blocked user can't just re-add the blocker to keep interacting.
export async function communityIsBlockedEitherWay(userAId, userBId) {
  if (!userAId || !userBId || userAId === userBId) return false;
  const block = await prisma.communityBlock.findFirst({
    where: {
      OR: [
        { blockerId: userAId, blockedId: userBId },
        { blockerId: userBId, blockedId: userAId },
      ],
    },
    select: { id: true },
  });
  return Boolean(block);
}

// The full set of user ids the given user has blocked OR is blocked
// by -- used to filter a list (posts, comments, members) down to
// "people who aren't in a block relationship with me" in one query
// instead of one lookup per row.
export async function communityBlockedUserIds(userId) {
  if (!userId) return new Set();
  const rows = await prisma.communityBlock.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  const ids = new Set();
  for (const row of rows) {
    ids.add(row.blockerId === userId ? row.blockedId : row.blockerId);
  }
  return ids;
}


// The Community Guidelines a member must acknowledge (Model 25
// addendum). Reuses the existing Legal & Info Pages CMS row
// (slug "community-guidelines") an admin can already edit at
// /admin/legal-pages/community-guidelines -- no separate guidelines
// content store. "Version" is just a hash of the effective body, so
// "require re-acceptance when the guidelines are updated" falls out
// of comparing hashes instead of a manual version number an admin
// has to remember to bump.
export async function communityGuidelinesContent() {
  const row = await prisma.legalPage.findUnique({ where: { slug: "community-guidelines" } });
  const fallback = DEFAULT_PAGES["community-guidelines"];
  const title = row?.title || fallback.title;
  const bodyHtml = row?.bodyHtml || fallback.bodyHtml;
  const hash = crypto.createHash("sha256").update(bodyHtml).digest("hex");
  return { title, bodyHtml, hash };
}

export async function communityGuidelinesAcceptanceStatus(userId) {
  if (!userId) return { accepted: false, acceptedAt: null, current: null };
  const [current, acceptance] = await Promise.all([
    communityGuidelinesContent(),
    prisma.communityGuidelinesAcceptance.findUnique({ where: { userId } }),
  ]);
  const accepted = Boolean(acceptance && acceptance.contentHash === current.hash);
  return { accepted, acceptedAt: accepted ? acceptance.acceptedAt : null, current };
}

// Used to gate the actual write actions (posting, commenting,
// blocking, reporting) server-side -- never trust the "Agree &
// Continue" checkbox on its own, per the standing rule that limits
// are enforced server-side, not just hidden in the UI.
export async function communityHasAcceptedGuidelines(userId) {
  const status = await communityGuidelinesAcceptanceStatus(userId);
  return status.accepted;
}
