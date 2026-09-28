import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Shared label for the public site-header "Dashboard" link when it
// resolves to a staff-role destination (getAccountDestination() below).
// A single source of truth here -- this label was previously a
// hardcoded string literal duplicated across two separate return
// statements in getAccountDestination(), and a past fix that only
// updated one of the two literals is why the old wording kept
// silently reappearing depending on which branch a given account hit.
export const STAFF_PORTAL_LABEL = "Staff Portal";

export type Module =
  | "STUDENT_MATTERS"
  | "ACADEMIC_RECORDS"
  | "FACULTY_MATTERS"
  | "DEPARTMENT_MATTERS"
  | "PROGRAM_MATTERS"
  | "COURSES_GRADES"
  | "EXAMINATIONS"
  | "FINANCE_FEES"
  | "FINANCE_PAYROLL"
  | "LIBRARY_OPS"
  | "ICT_OPS"
  | "ADMISSIONS"
  | "QUALITY_ASSURANCE"
  | "OTHER_ADMIN"
  | "RESEARCH_OPS";

export type Action = "view" | "edit";

/**
 * Require a staff member to have permission for a specific institutional
 * module/action.
 *
 * SUPER_ADMIN bypasses module-level checks.
 */
export async function requireModulePermission(
  module: Module,
  action: Action
) {
  const user = await requireUser();

  if (user.role === "SUPER_ADMIN") {
    return user;
  }

  const staff = await prisma.staffProfile.findUnique({
    where: { userId: user.id },
    include: {
      position: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!staff || !staff.isActive) {
    throw new Error("FORBIDDEN");
  }

  const permission = staff.position.permissions.find(
    (item) => item.module === module
  );

  if (!permission) {
    throw new Error("FORBIDDEN");
  }

  const allowed =
    action === "view"
      ? permission.canView
      : permission.canEdit;

  if (!allowed) {
    throw new Error("FORBIDDEN");
  }

  return user;
}

/**
 * Determine the correct staff dashboard for a logged-in user.
 *
 * The destination is based on:
 * 1. SUPER_ADMIN / ADMIN account role
 * 2. INSTRUCTOR account role
 * 3. Actual PositionPermission records
 *
 * This must remain server-side so dashboard routing cannot be
 * manipulated from the client.
 */
export async function getStaffDestination(
  userId: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  if (user.role === "SUPER_ADMIN") {
    return "/admin";
  }

  const staff = await prisma.staffProfile.findUnique({
    where: { userId },
    include: {
      position: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!staff || !staff.isActive) {
    return user.role === "ADMIN" ? "/admin" : null;
  }

  const hasPermission = (
    module: Module,
    action: Action
  ): boolean => {
    const permission = staff.position.permissions.find(
      (item) => item.module === module
    );

    if (!permission) {
      return false;
    }

    return action === "view"
      ? permission.canView
      : permission.canEdit;
  };

  /*
   * Operational destinations.
   *
   * Order matters when a staff member has multiple edit permissions.
   * The most institutionally specific operational destination is
   * selected first.
   */
  if (hasPermission("FACULTY_MATTERS", "edit")) {
    return "/dean-dashboard";
  }

  if (hasPermission("DEPARTMENT_MATTERS", "edit")) {
    return "/hod-dashboard";
  }

  if (hasPermission("PROGRAM_MATTERS", "edit")) {
    return "/coordinator-dashboard";
  }

  if (hasPermission("COURSES_GRADES", "edit")) {
    return "/instructor-dashboard";
  }

  if (hasPermission("ADMISSIONS", "edit")) {
    return "/registry-dashboard";
  }

  if (hasPermission("ACADEMIC_RECORDS", "edit")) {
    return "/academic-records-dashboard";
  }

  if (hasPermission("EXAMINATIONS", "edit")) {
    return "/examinations-dashboard";
  }

  if (hasPermission("FINANCE_FEES", "edit")) {
    return "/finance-dashboard";
  }

  if (hasPermission("LIBRARY_OPS", "edit")) {
    return "/library-dashboard";
  }

  if (hasPermission("ICT_OPS", "edit")) {
    return "/ict-dashboard";
  }

  /*
   * Dedicated operational dashboards for QA and Student Affairs.
   */
  if (hasPermission("QUALITY_ASSURANCE", "edit")) {
    return "/qa-dashboard";
  }

  if (hasPermission("STUDENT_MATTERS", "edit")) {
    return "/student-affairs-dashboard";
  }

  /*
   * Research & Scholarly Affairs -- a dedicated delegated-operation
   * department (same shape as QA/Student Affairs above), not a
   * hierarchical academic-chain position.
   */
  if (hasPermission("RESEARCH_OPS", "edit")) {
    return "/research-dashboard";
  }


  /*
   * Academic Advisor is a view-only position (STUDENT_MATTERS view, no
   * edit) with its own dedicated dashboard for advisee messaging, so it
   * is routed by position name rather than an edit permission.
   */
  if (staff.position.nameEn === "Academic Advisor") {
    return "/advisor-dashboard";
  }

  /*
   * Other administrative staff with no dedicated dashboard.
   */
  if (hasPermission("OTHER_ADMIN", "edit")) {
    return "/admin";
  }

  /*
   * Plain ADMIN with no operational staff destination.
   */
  if (user.role === "ADMIN") {
    return "/admin";
  }

  return null;
}

/**
 * Model 32 §1: "If a user has multiple roles, provide an explicit
 * dashboard/system switcher utility rather than forcing them into a
 * single department container."
 *
 * getStaffDestination() above answers "which ONE dashboard" using a
 * fixed priority order -- correct for routing someone straight to
 * their most specific workspace right after login, and left
 * untouched so every existing call site (getAccountDestination,
 * app/layout.jsx, the login flow) keeps behaving exactly as before.
 *
 * This is the plural counterpart: every real position permission on
 * the account maps to its own dedicated dashboard, a staff member
 * whose position legitimately grants edit access to more than one of
 * these (e.g. a Deputy Registrar with both ADMISSIONS and
 * ACADEMIC_RECORDS edit access) gets every one of them listed, not
 * just whichever happened to win the priority order. Entirely driven
 * by the same real PositionPermission rows -- no hardcoded user/email
 * logic (§11).
 */
export async function getStaffDestinations(
  userId: string
): Promise<Array<{ href: string; label: string }>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return [];
  }

  if (user.role === "SUPER_ADMIN") {
    return [{ href: "/admin", label: "Admin Dashboard" }];
  }

  const staff = await prisma.staffProfile.findUnique({
    where: { userId },
    include: {
      position: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!staff || !staff.isActive) {
    return user.role === "ADMIN" ? [{ href: "/admin", label: "Admin Dashboard" }] : [];
  }

  const hasPermission = (module: Module, action: Action): boolean => {
    const permission = staff.position.permissions.find((item) => item.module === module);
    if (!permission) return false;
    return action === "view" ? permission.canView : permission.canEdit;
  };

  // Same module -> dashboard mapping as getStaffDestination() above,
  // just collected instead of short-circuited on the first match.
  const CANDIDATES: Array<{ module: Module; href: string; label: string }> = [
    { module: "FACULTY_MATTERS", href: "/dean-dashboard", label: "Dean Dashboard" },
    { module: "DEPARTMENT_MATTERS", href: "/hod-dashboard", label: "Head of Department Dashboard" },
    { module: "PROGRAM_MATTERS", href: "/coordinator-dashboard", label: "Programme Coordinator Dashboard" },
    { module: "COURSES_GRADES", href: "/instructor-dashboard", label: "Instructor Dashboard" },
    { module: "ADMISSIONS", href: "/registry-dashboard", label: "Registry Dashboard" },
    { module: "ACADEMIC_RECORDS", href: "/academic-records-dashboard", label: "Academic Records Dashboard" },
    { module: "EXAMINATIONS", href: "/examinations-dashboard", label: "Examinations Dashboard" },
    { module: "FINANCE_FEES", href: "/finance-dashboard", label: "Finance Dashboard" },
    { module: "LIBRARY_OPS", href: "/library-dashboard", label: "Library Dashboard" },
    { module: "ICT_OPS", href: "/ict-dashboard", label: "ICT Dashboard" },
    { module: "QUALITY_ASSURANCE", href: "/qa-dashboard", label: "Quality Assurance Dashboard" },
    { module: "STUDENT_MATTERS", href: "/student-affairs-dashboard", label: "Student Affairs Dashboard" },
    { module: "RESEARCH_OPS", href: "/research-dashboard", label: "Research & Scholarly Affairs Dashboard" },
  ];

  const destinations: Array<{ href: string; label: string }> = [];

  for (const candidate of CANDIDATES) {
    if (hasPermission(candidate.module, "edit")) {
      destinations.push({ href: candidate.href, label: candidate.label });
    }
  }

  // Same view-only special case as getStaffDestination() above.
  if (staff.position.nameEn === "Academic Advisor") {
    destinations.push({ href: "/advisor-dashboard", label: "Academic Advisor Dashboard" });
  }

  if (hasPermission("OTHER_ADMIN", "edit") || user.role === "ADMIN") {
    destinations.push({ href: "/admin", label: "Admin Dashboard" });
  }

  // De-duplicate by href (OTHER_ADMIN + plain ADMIN both point at
  // /admin and could otherwise double up the same entry).
  const seen = new Set<string>();
  return destinations.filter((d) => {
    if (seen.has(d.href)) return false;
    seen.add(d.href);
    return true;
  });
}

/**
 * Where a logged-in user's "My Account" / "Dashboard" link in the public
 * site header (and the /account login form) should actually send them.
 *
 * Three real account types share this codebase and each has its own
 *
 * Three real account types share this codebase and each has its own
 * home: staff/admin get their operational dashboard (getStaffDestination
 * above), a student gets the real student portal, and everyone else
 * (a bookstore customer, an author, a media subscriber with no student
 * or staff profile) gets the bookstore/media account page. Before this,
 * every logged-in user was sent to the same /dashboard regardless of
 * which of these they actually were.
 */
export async function getAccountDestination(
  userId: string
): Promise<{ href: string; label: string }> {
  const staffDestination = await getStaffDestination(userId);

  // Bug fix: an account can genuinely be BOTH a student (a real
  // StudentProfile row -- e.g. a test/demo account, or a staff member
  // who is also enrolled) AND carry role "ADMIN" or hold a
  // StaffProfile. getStaffDestination()'s own last-resort branches
  // ("no active StaffProfile" and "plain ADMIN with no operational
  // staff destination") both resolve to the bare "/admin" fallback
  // purely off `user.role === "ADMIN"`, with no awareness of student
  // status at all -- so previously, ANY such dual-identity account
  // was silently and permanently routed to "Staff Dashboard" here,
  // and the student check below never even ran. That is what the
  // header's Dashboard/Student Portal link was regressing to.
  //
  // The fix: student identity wins over that bare ADMIN fallback,
  // since "has the ADMIN role with no real operational permission" is
  // an administrative label, not a genuine staff destination -- the
  // Admin Portal is still reachable at any time via its own nav/URL.
  // A truly GENUINE operational destination -- SUPER_ADMIN, or a real
  // StaffProfile holding an actual module permission -- still wins
  // over student status, since that reflects a real staff role, not
  // just a role label. Checked by role directly (not by comparing the
  // resolved href, since SUPER_ADMIN's own destination is also
  // literally "/admin" and must not be confused with the bare-ADMIN
  // fallback that resolves to the same string).
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, authorStatus: true },
  });

  const isBareAdminFallback =
    staffDestination === "/admin" && user?.role === "ADMIN";

  if (staffDestination && !isBareAdminFallback) {
    return { href: staffDestination, label: STAFF_PORTAL_LABEL };
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (student) {
    return { href: "/login", label: "Student Portal" };
  }

  if (staffDestination) {
    return { href: staffDestination, label: STAFF_PORTAL_LABEL };
  }

  // An AUTHOR-role account is its own distinct account type -- never
  // the generic Bookstore/Media chooser below, which is for an
  // ordinary customer account with no author relationship at all.
  // Model 31 §11 bug fix: an author whose application hasn't been
  // approved yet is routed back to the admission/track page (where
  // they can see their real status and pay the application fee if
  // they haven't), and an approved author goes to the real Author
  // Portal -- never to /account/dashboard, which has no idea what an
  // "author" is and would otherwise let them wander into the
  // Bookstore/Media account chooser despite never having bought a
  // book or subscribed to Media themselves.
  // (`user` already fetched above for the dual-identity check.)
  if (user?.role === "AUTHOR") {
    if (user.authorStatus === "APPROVED") {
      return { href: "/author-portal/admission", label: "Author Portal" };
    }
    return { href: "/author-portal/admission/track", label: "Author Application" };
  }

  return { href: "/account/dashboard", label: "My Account" };
}

/**
 * Where the public site-header "Dashboard"/"Student Portal" link
 * specifically should send a logged-in user.
 *
 * This link is documented as STUDENT-ONLY -- always. That is a
 * stricter rule than "student identity wins when both are present on
 * the same account" (the first fix here): the header must never
 * resolve to a staff/admin destination, full stop, no matter which
 * account is CURRENTLY signed in to this browser session.
 *
 * Why that distinction matters: getCurrentUser() in app/layout.jsx
 * reflects whichever account is active in this browser session right
 * now, not a fixed identity. A student can legitimately sign out of
 * nothing and instead follow the separate Staff & Admin Portal link
 * in the footer to sign in to a staff/admin account in the SAME
 * browser -- at that point the session's current user genuinely has
 * no StudentProfile (it's the staff account), so falling through to
 * getAccountDestination() correctly-per-session but WRONGLY resolves
 * the header link to the staff destination/label. That's a trap: a
 * student (or an instructor who stepped away mid-session) would have
 * no way back to their own student portal from the header, since
 * clicking it would just re-open the staff/admin account that's
 * currently signed in.
 *
 * The fix: the header link always sends to /login (the student
 * sign-in page), for ANY currently-signed-in account -- never a
 * staff/admin destination. That means a student always has a way back
 * to signing in as themselves from the header, regardless of what
 * other account (staff, admin, bookstore, author) is currently signed
 * in on this browser.
 *
 * getAccountDestination()'s staff-first / bookstore / author routing
 * remains exactly as before for its real consumer, the post-login
 * redirect in app/api/auth/account-destination/route.js -- this
 * function does not call it at all, on purpose.
 */
export async function getHeaderDestination(
  userId: string
): Promise<{ href: string; label: string }> {
  // userId is kept as a parameter (unused) so this function's
  // signature and its call site in app/layout.jsx don't need to
  // change if a future student-specific header treatment needs it.
  void userId;
  return { href: "/login", label: "Student Portal" };
}

/**
 * Admissions is an oversight/operation split:
 *
 * ADMIN / SUPER_ADMIN:
 *   - can view admissions
 *
 * Admissions/Registry staff:
 *   - can operate admissions through ADMISSIONS.edit
 */
export async function requireAdmissionsView() {
  const user = await requireUser();

  if (
    user.role === "ADMIN" ||
    user.role === "SUPER_ADMIN"
  ) {
    return user;
  }

  return requireModulePermission("ADMISSIONS", "view");
}

export async function requireAdmissionsEdit() {
  const user = await requireUser();

  if (user.role === "SUPER_ADMIN") {
    return user;
  }

  return requireModulePermission("ADMISSIONS", "edit");
}

/**
 * Academic Advisor is a real, dedicated Position (STUDENT_MATTERS view,
 * no edit -- see prisma/seed.js) with its own dashboard and its own
 * student-facing operations (advisee messaging, placement actions).
 * There is no separate ACADEMIC_ADVISING module: the position already
 * carries the correct institutional permission (view access into
 * Student Matters), so gating on that permission plus the specific
 * position name is the real ownership boundary -- not "any staff
 * member with any StaffProfile row", which is what every advisor
 * route/layout checked before this helper existed and let ANY staff
 * position (ICT, Finance, Library, ...) reach advisee messaging and
 * placement actions on arbitrary students.
 *
 * SUPER_ADMIN bypasses, matching every other requireXxx helper in this
 * file. Plain ADMIN/SUPER_ADMIN oversight of advising is intentionally
 * NOT granted here -- Admin's advising view is the separate, genuinely
 * read-only /admin/advising oversight page, which queries Prisma
 * directly rather than going through this operational gate.
 */
export async function requireAdvisor() {
  const user = await requireUser();

  // No SUPER_ADMIN bypass here (unlike requireModulePermission /
  // requireAdmissionsView elsewhere in this file): every advisor route
  // needs a real staff.id to scope its data (academicAdvisorId,
  // assessedByStaffId), which a SUPER_ADMIN account does not have.
  // Admin/SUPER_ADMIN oversight of advising is the separate, genuinely
  // read-only /admin/advising page -- not this operational gate.
  await requireModulePermission("STUDENT_MATTERS", "view");

  const staff = await prisma.staffProfile.findUnique({
    where: { userId: user.id },
    include: { position: true },
  });

  if (!staff || !staff.isActive || staff.position.nameEn !== "Academic Advisor") {
    throw new Error("FORBIDDEN");
  }

  return { user, staff };
}
