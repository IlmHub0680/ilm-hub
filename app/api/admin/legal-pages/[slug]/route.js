import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { DEFAULT_PAGES } from '@/lib/legalContentDefaults';

const VALID_SLUGS = ['about', 'privacy', 'terms', 'refund', 'admission-requirements', 'community-guidelines', 'academic-policies', 'student-resources', 'academy-foundation', 'academy-governance', 'academy-pathways', 'academy-curriculum', 'academy-department-curriculum', 'academy-course-catalogue', 'academy-course-specifications', 'academy-assessment-grading', 'academy-student-lifecycle', 'academy-faculty-portals', 'academy-academic-regulations', 'academy-master-integration'];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(request, { params }) {
  try {
    await requireAdmin();

    const { slug } = await params;

    if (!VALID_SLUGS.includes(slug)) {
      return json({ success: false, error: 'Unknown legal page.' }, 404);
    }

    const page = await prisma.legalPage.findUnique({ where: { slug } });

    // No row saved yet — show the site's real current content
    // (the same copy the public page falls back to), not an empty
    // box, so an admin never mistakes "nothing saved" for "nothing
    // there" and accidentally overwrites real content with blank text.
    return json({
      success: true,
      data: page
        ? { title: page.title, bodyHtml: page.bodyHtml, updatedAt: page.updatedAt }
        : { title: DEFAULT_PAGES[slug].title, bodyHtml: DEFAULT_PAGES[slug].bodyHtml, updatedAt: null },
    });
  } catch (error) {
    if (error?.message === 'UNAUTHORIZED') return json({ success: false, error: 'Unauthorized.' }, 401);
    if (error?.message === 'FORBIDDEN') return json({ success: false, error: 'Admin access required.' }, 403);
    console.error('GET legal page error:', error);
    return json({ success: false, error: 'Failed to load page.' }, 500);
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();

    const { slug } = await params;

    if (!VALID_SLUGS.includes(slug)) {
      return json({ success: false, error: 'Unknown legal page.' }, 404);
    }

    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const bodyHtml = typeof body.bodyHtml === 'string' ? body.bodyHtml : '';

    if (!title) {
      return json({ success: false, error: 'Title is required.' }, 400);
    }

    const page = await prisma.legalPage.upsert({
      where: { slug },
      update: { title, bodyHtml },
      create: { slug, title, bodyHtml },
    });

    return json({
      success: true,
      data: { title: page.title, bodyHtml: page.bodyHtml, updatedAt: page.updatedAt },
    });
  } catch (error) {
    if (error?.message === 'UNAUTHORIZED') return json({ success: false, error: 'Unauthorized.' }, 401);
    if (error?.message === 'FORBIDDEN') return json({ success: false, error: 'Admin access required.' }, 403);
    console.error('PUT legal page error:', error);
    return json({ success: false, error: 'Failed to save page.' }, 500);
  }
}
