import { prisma } from '@/lib/prisma';
import { DEFAULT_PAGES, DEFAULT_FAQS, DEFAULT_FAQS_TECHNICAL, DEFAULT_CONTACT } from '@/lib/legalContentDefaults';

// Same fixed id the admin route (app/api/admin/legal-pages/contact/
// route.js) always upserts to -- this MUST match that id, or a save
// there can silently never be reflected here (see B in Model 31).
const CONTACT_SETTINGS_ID = 'default-contact-info';

// Public, read-only endpoint for the institute's Legal & Info Pages
// CMS (About, Privacy Policy, Terms of Use, Refund Policy, FAQ,
// Contact). Every page falls back to defaults matching the site's
// original hardcoded content whenever a row is missing or the
// database is unreachable, so the public site never regresses and
// never shows a broken/empty legal page.

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET() {
  // Only the genuinely public documents are exposed here -- the
  // Academy's internal governance/curriculum/department-curriculum/
  // course-catalogue/course-specifications/assessment-grading/
  // student-lifecycle/faculty-portals/academic-regulations/master-
  // integration planning documents stay admin-only (still fully
  // readable and editable at /admin/academy-*), never spread into
  // this public payload even as a fallback default.
  const PUBLIC_SLUGS = ['about', 'privacy', 'terms', 'refund', 'admission-requirements', 'community-guidelines', 'academic-policies', 'student-resources', 'academy-foundation', 'academy-pathways'];
  const result = {
    pages: Object.fromEntries(PUBLIC_SLUGS.map((slug) => [slug, DEFAULT_PAGES[slug]])),
    faqs: DEFAULT_FAQS,
    // Shown at /it-support (Model 26) -- genuinely different content
    // from the general FAQ above, not the same list twice.
    faqsTechnical: DEFAULT_FAQS_TECHNICAL,
    contact: DEFAULT_CONTACT,
  };

  try {
    const [pages, faqs, contact] = await Promise.all([
      prisma.legalPage.findMany({
        where: { slug: { in: PUBLIC_SLUGS } },
      }),
      prisma.faqItem.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      // Was findFirst({orderBy:{createdAt:'asc'}}) -- read "whichever
      // row happens to be oldest" instead of the one fixed row the
      // admin Contact settings page actually saves to. If more than
      // one ContactInfo row ever existed, admin saves would never
      // show up here no matter how many times they were made (this
      // was reported as "P.O. Box doesn't update", but would affect
      // every field on this form the same way).
      prisma.contactInfo.findUnique({ where: { id: CONTACT_SETTINGS_ID } }),
    ]);

    for (const page of pages) {
      if (DEFAULT_PAGES[page.slug]) {
        result.pages[page.slug] = { title: page.title, bodyHtml: page.bodyHtml };
      }
    }

    const generalFaqs = faqs.filter((f) => (f.category || 'general') === 'general');
    const technicalFaqs = faqs.filter((f) => f.category === 'technical');

    if (generalFaqs.length > 0) {
      result.faqs = generalFaqs.map((f) => ({ question: f.question, answer: f.answer }));
    }

    if (technicalFaqs.length > 0) {
      result.faqsTechnical = technicalFaqs.map((f) => ({ question: f.question, answer: f.answer }));
    }

    if (contact) {
      result.contact = {
        address: contact.address || DEFAULT_CONTACT.address,
        poBox: contact.poBox || DEFAULT_CONTACT.poBox,
        phone: contact.phone || DEFAULT_CONTACT.phone,
        whatsapp: contact.whatsapp || DEFAULT_CONTACT.whatsapp,
        email: contact.email || DEFAULT_CONTACT.email,
        admissionsEmail: contact.admissionsEmail || DEFAULT_CONTACT.admissionsEmail,
        bookstoreEmail: contact.bookstoreEmail || DEFAULT_CONTACT.bookstoreEmail,
        officeHours: contact.officeHours || DEFAULT_CONTACT.officeHours,
      };
    }
  } catch (error) {
    console.error('Public legal-content GET error (serving defaults):', error);
  }

  return json({ success: true, data: result });
}
