import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { DEFAULT_FAQS, DEFAULT_FAQS_TECHNICAL } from '@/lib/legalContentDefaults';

const ALL_DEFAULT_FAQS = [...DEFAULT_FAQS, ...DEFAULT_FAQS_TECHNICAL];
const VALID_CATEGORIES = ['general', 'technical'];

// Full-replace-on-save, matching the pattern already used for
// SocialLink / FooterLinkGroup: FAQ entries have no external
// references by id, so validating and replacing the whole ordered
// list in one transaction is simpler than granular per-item CRUD.

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET() {
  try {
    await requireAdmin();

    const faqs = await prisma.faqItem.findMany({ orderBy: { order: 'asc' } });

    // Nothing saved yet — show the site's real current FAQ list (the
    // same list the public /faq page falls back to), not an empty
    // form, so an admin never mistakes "nothing saved" for "nothing
    // there" and accidentally saves over real content with a blank list.
    const data =
      faqs.length > 0
        ? faqs.map((f) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            category: f.category || 'general',
            order: f.order,
            isActive: f.isActive,
          }))
        : ALL_DEFAULT_FAQS.map((f, index) => ({
            id: null,
            question: f.question,
            answer: f.answer,
            category: f.category || 'general',
            order: index,
            isActive: true,
          }));

    return json({ success: true, data });
  } catch (error) {
    if (error?.message === 'UNAUTHORIZED') return json({ success: false, error: 'Unauthorized.' }, 401);
    if (error?.message === 'FORBIDDEN') return json({ success: false, error: 'Admin access required.' }, 403);
    console.error('GET faq error:', error);
    return json({ success: false, error: 'Failed to load FAQ.' }, 500);
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : null;

    if (!items) {
      return json({ success: false, error: 'items must be an array.' }, 400);
    }

    for (const item of items) {
      if (!item?.question?.trim() || !item?.answer?.trim()) {
        return json({ success: false, error: 'Every FAQ entry needs a question and an answer.' }, 400);
      }
    }

    await prisma.$transaction([
      prisma.faqItem.deleteMany({}),
      ...items.map((item, index) =>
        prisma.faqItem.create({
          data: {
            question: item.question.trim(),
            answer: item.answer.trim(),
            category: VALID_CATEGORIES.includes(item.category) ? item.category : 'general',
            order: index,
            isActive: item.isActive !== false,
          },
        })
      ),
    ]);

    const faqs = await prisma.faqItem.findMany({ orderBy: { order: 'asc' } });

    return json({
      success: true,
      data: faqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category || 'general',
        order: f.order,
        isActive: f.isActive,
      })),
    });
  } catch (error) {
    if (error?.message === 'UNAUTHORIZED') return json({ success: false, error: 'Unauthorized.' }, 401);
    if (error?.message === 'FORBIDDEN') return json({ success: false, error: 'Admin access required.' }, 403);
    console.error('PUT faq error:', error);
    return json({ success: false, error: 'Failed to save FAQ.' }, 500);
  }
}
