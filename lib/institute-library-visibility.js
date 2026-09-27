// Single source of truth for institute Digital Library
// (InstituteLibraryResource) visibility enforcement. Every route that
// reads/lists/searches/links InstituteLibraryResource rows for a
// CONSUMING viewer must build its Prisma `where` clause and/or filter
// its results through the helpers below, rather than re-deriving this
// logic ad hoc.
//
// This is a fresh, correctly-scoped rewrite of design work an earlier
// build did well but wired onto the wrong (personal) model -- see
// prisma/schema.prisma's InstituteLibraryResource comment for the
// full history. Do NOT reuse or confuse this with LibraryResource
// (the platform owner's own personal public reading library), which
// has no viewer-tiering at all -- only isPublished.
//
// Design recap:
//   isPublished  -- coarse kill-switch. false = invisible to EVERYONE,
//                   including staff/admin. Defaults to false for this
//                   model (institute content requires deliberate
//                   publication).
//   visibility   -- fine-grained tier, only consulted once
//                   isPublished === true.
//
// A given viewer may see a resource IFF:
//   resource.isPublished === true
//   AND viewerTier(viewer) is at or above resource.visibility's rank.
//
// Tier ranks (low -> high; a viewer at rank N sees every visibility
// tier at or below N):
//   0  PUBLIC              -- anyone, including anonymous visitors
//   1  INSTITUTE_ONLY       -- any signed-in institute account
//   2  STUDENTS_AND_STAFF   -- enrolled students and staff (not just
//                              "any logged-in user")
//   3  FACULTY_STAFF_ONLY   -- faculty/instructional staff and above
//                              (INSTRUCTOR role, or any active
//                              StaffProfile holder, or ADMIN/SUPER_ADMIN)
//   4  RESTRICTED           -- Admin/SUPER_ADMIN, or a staff member
//                              whose position explicitly holds
//                              LIBRARY_OPS view permission (the
//                              Librarian / Library Services delegated
//                              role that owns this feature)

import { prisma } from "@/lib/prisma";
import {
  INSTITUTE_LIBRARY_VISIBILITY_RANK,
  INSTITUTE_LIBRARY_VISIBILITY_TIERS,
  VALID_INSTITUTE_LIBRARY_VISIBILITIES,
  isVisibleAtInstituteLibraryRank,
} from "@/lib/institute-library-visibility.constants";

// Re-exported for backward compatibility -- existing server-side
// imports of these from this file continue to work unchanged. Client
// components should import them from
// "@/lib/institute-library-visibility.constants" directly instead, so
// they don't pull in the `prisma` import above (which drags the `pg`
// driver into the bundle and fails to compile for the browser).
export {
  INSTITUTE_LIBRARY_VISIBILITY_RANK,
  INSTITUTE_LIBRARY_VISIBILITY_TIERS,
  VALID_INSTITUTE_LIBRARY_VISIBILITIES,
  isVisibleAtInstituteLibraryRank,
};

/**
 * Resolve a viewer's effective institute Digital Library access rank
 * from a SessionUser (as returned by getCurrentUser()/requireUser()),
 * or `null` for an anonymous visitor.
 */
export async function getViewerInstituteLibraryRank(user) {
  if (!user) {
    return INSTITUTE_LIBRARY_VISIBILITY_RANK.PUBLIC;
  }

  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    return INSTITUTE_LIBRARY_VISIBILITY_RANK.RESTRICTED;
  }

  // Any staff member whose position explicitly holds the Librarian /
  // Library Services delegated permission (LIBRARY_OPS view) gets the
  // same elevated RESTRICTED clearance as Admin.
  const staff = await prisma.staffProfile.findUnique({
    where: { userId: user.id },
    select: {
      isActive: true,
      position: {
        select: {
          permissions: {
            where: { module: "LIBRARY_OPS" },
            select: { canView: true },
          },
        },
      },
    },
  });

  if (staff?.isActive && staff.position.permissions.some((p) => p.canView)) {
    return INSTITUTE_LIBRARY_VISIBILITY_RANK.RESTRICTED;
  }

  // Faculty/instructional staff: the INSTRUCTOR role, or any other
  // active staff position not already caught above.
  if (user.role === "INSTRUCTOR" || staff?.isActive) {
    return INSTITUTE_LIBRARY_VISIBILITY_RANK.FACULTY_STAFF_ONLY;
  }

  // Enrolled student.
  const student = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (student) {
    return INSTITUTE_LIBRARY_VISIBILITY_RANK.STUDENTS_AND_STAFF;
  }

  // Any other signed-in account is still a real institute-site
  // account, so it clears INSTITUTE_ONLY but nothing higher.
  return INSTITUTE_LIBRARY_VISIBILITY_RANK.INSTITUTE_ONLY;
}

/**
 * Convenience wrapper: resolve the viewer's rank from a session user
 * (or null) and check a single resource in one call.
 */
export async function canViewInstituteLibraryResource(resource, user) {
  const rank = await getViewerInstituteLibraryRank(user);
  return isVisibleAtInstituteLibraryRank(resource, rank);
}

/**
 * Build the Prisma `where` fragment for listing/searching
 * InstituteLibraryResource rows for a given viewer rank --
 * isPublished: true AND visibility IN (every tier at or below the
 * viewer's rank). Spread this into a route's existing `where` object
 * alongside any category/search clauses.
 */
export function instituteLibraryVisibilityWhere(viewerRank) {
  const allowedVisibilities = Object.entries(INSTITUTE_LIBRARY_VISIBILITY_RANK)
    .filter(([, rank]) => rank <= viewerRank)
    .map(([name]) => name);

  return {
    isPublished: true,
    visibility: { in: allowedVisibilities },
  };
}
