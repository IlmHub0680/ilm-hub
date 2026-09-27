// Client-safe constants and pure helpers for institute Digital Library
// (InstituteLibraryResource) visibility. Split out of
// lib/institute-library-visibility.js so that client components can
// import the tier list/labels without pulling in that file's `prisma`
// import (and, transitively, the `pg` driver, which fails to bundle
// for the browser -- `Module not found: Can't resolve 'tls'`).
//
// Anything that needs a database lookup (getViewerInstituteLibraryRank,
// canViewInstituteLibraryResource, instituteLibraryVisibilityWhere)
// stays server-only in lib/institute-library-visibility.js, which
// re-exports everything below for backward compatibility -- existing
// server-side imports do not need to change.

export const INSTITUTE_LIBRARY_VISIBILITY_RANK = {
  PUBLIC: 0,
  INSTITUTE_ONLY: 1,
  STUDENTS_AND_STAFF: 2,
  FACULTY_STAFF_ONLY: 3,
  RESTRICTED: 4,
};

// Display metadata for admin/Librarian-dashboard UI selects, with the
// spec's own emoji labels.
export const INSTITUTE_LIBRARY_VISIBILITY_TIERS = [
  { value: "INSTITUTE_ONLY", label: "🔒 Institute Only" },
  { value: "STUDENTS_AND_STAFF", label: "🎓 Students & Staff" },
  { value: "FACULTY_STAFF_ONLY", label: "👨‍🏫 Faculty & Staff Only" },
  { value: "PUBLIC", label: "🌐 Public" },
  { value: "RESTRICTED", label: "🔐 Restricted" },
];

export const VALID_INSTITUTE_LIBRARY_VISIBILITIES = INSTITUTE_LIBRARY_VISIBILITY_TIERS.map(
  (t) => t.value
);

/**
 * True iff a viewer at the given rank may see a resource with the
 * given isPublished/visibility pair. Use this for a single
 * already-fetched row (e.g. the [slug] detail route, or a
 * course-reading link).
 */
export function isVisibleAtInstituteLibraryRank(resource, viewerRank) {
  if (!resource || !resource.isPublished) {
    return false;
  }

  const requiredRank = INSTITUTE_LIBRARY_VISIBILITY_RANK[resource.visibility];

  if (requiredRank === undefined) {
    // Unknown/corrupt visibility value -- fail closed.
    return false;
  }

  return viewerRank >= requiredRank;
}
