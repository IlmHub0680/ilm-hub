import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { matchKnowledge, menuFor, relatedFor, MORE_OPTIONS_VALUE } from '@/lib/assistantKnowledge';
import { getStaffDestination } from '@/lib/permissions';
import { detectGreeting, isPureGreeting, greetingReply } from '@/lib/assistantGreetings';

export const dynamic = 'force-dynamic';

// Institute assistant — rule-based, no external AI API.
//
// Security rules (do not relax these):
//  - The current user is ALWAYS derived server-side from the session cookie
//    via getCurrentUser(). The request body is never trusted for identity —
//    there is no studentId/userId field read from the client.
//  - An authenticated user can only ever see data scoped to their OWN id.
//  - An unauthenticated visitor gets general institute information only,
//    never anything from the database.
//  - No internal system details (schema, other users, admin-only data,
//    API keys, etc.) are ever included in a response.
//
// Context awareness:
//  - The client tells us which part of the site it's asking from via
//    `zone` ('student' | 'bookstore' | 'media' | 'library' | 'general') — this is only
//    ever used to pick a smaller, more relevant suggestion menu and to
//    lightly tie-break knowledge lookups. It never gates or grants access
//    to anything; every data lookup below is still scoped to the
//    server-derived signed-in user regardless of the zone the client claims.

const KNOWN_ZONES = new Set(['student', 'employee', 'bookstore', 'media', 'library', 'general']);

function sanitizeZone(zone) {
  return typeof zone === 'string' && KNOWN_ZONES.has(zone) ? zone : 'general';
}

function personalIntent(text) {
  if (/\bmy (orders?|purchases?)\b/.test(text)) return 'orders';
  if (/\bmy (books?|library|downloads?)\b/.test(text)) return 'books';
  if (/\bmy (requests?|transcript status|application status)\b/.test(text)) return 'requests';
  if (/\bwho am i\b|\bmy (account|profile)\b/.test(text)) return 'profile';

  // "My Dashboard" (Employee identity quick option) -- the destination
  // depends entirely on the signed-in staff member's real position and
  // PositionPermission rows, resolved server-side, never guessed.
  if (/\bmy (staff )?dashboard\b/.test(text) || /\bwhere('?s| is) my dashboard\b/.test(text)) {
    return 'staff-dashboard';
  }

  // "has my admission been approved" / "what's my admission status" / etc —
  // only fires when BOTH an admission word and a status/progress word are
  // present, so a plain "how do I apply for admission" still falls through
  // to the general admissions knowledge entry instead.
  if (/\badmission\b/.test(text) && /\b(status|approve|approved|progress|update|pending|review|rejected)\b/.test(text)) {
    return 'admission-status';
  }

  // "what is my subscription status" / "is my subscription active" / etc.
  if (
    /\bmy subscription\b/.test(text) ||
    (/\bsubscri/.test(text) && /\b(status|active|expire|expired|renew)\b/.test(text)) ||
    /\bam i subscribed\b/.test(text)
  ) {
    return 'subscription-status';
  }

  return null;
}

// A message that's just a courtesy ask for help/options ("help", "menu",
// "what can you do") — surface the small zone menu instead of either a
// generic wall of text or the "I couldn't find anything" fallback.
// Best-effort, never allowed to affect the actual reply -- a logging
// failure must never turn into a broken assistant response.
async function logAssistantEvent(data) {
  try {
    await prisma.assistantEvent.create({ data });
  } catch (err) {
    console.error('Assistant event logging error:', err);
  }
}

function wantsMenu(text) {
  return /^(help|menu|options?)$/.test(text) ||
    /\b(what can you( help( with)?| do)?|what do you do|what can i ask( you)?|show me (what|the )?options)\b/.test(text);
}

const ADMISSION_STATUS_LABELS = {
  PENDING_PAYMENT: 'awaiting payment',
  PAID: 'payment received — awaiting review',
  UNDER_REVIEW: 'under review',
  APPROVED: 'approved',
  REJECTED: 'not approved',
};

const SUBSCRIPTION_STATUS_LABELS = {
  PENDING: 'pending approval',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }
  if (message.length > 500) {
    return NextResponse.json({ error: 'Message is too long.' }, { status: 400 });
  }

  // Defense in depth: the widget already hides itself when an admin has
  // disabled the assistant (GET /api/assistant/settings), but this
  // endpoint enforces it too, since it can be called directly.
  try {
    const settings = await prisma.assistantSettings.findUnique({
      where: { id: 'default-assistant-settings' },
      select: { isEnabled: true },
    });
    if (settings && settings.isEnabled === false) {
      return NextResponse.json(
        { reply: 'The assistant is currently unavailable.', department: null, options: [] },
        { status: 200 }
      );
    }
  } catch {
    // If the settings lookup itself fails, fail open rather than take
    // the whole assistant down over an unrelated database hiccup.
  }

  const zone = sanitizeZone(body?.zone);
  const text = message.toLowerCase();
  const user = await getCurrentUser(); // null if not signed in — never inferred from the request body
  const firstName = user?.name ? user.name.split(' ')[0] : null;

  // --- Greetings: recognized as greetings, never as information requests ---
  const greetingType = detectGreeting(message);
  if (greetingType && isPureGreeting(message)) {
    return NextResponse.json({
      reply: greetingReply(greetingType, firstName),
      department: null,
      options: menuFor(zone),
      showMenu: true,
    });
  }

  // --- A courtesy "help"/"menu" ask: show a small, relevant menu ---
  if (wantsMenu(text)) {
    return NextResponse.json({
      reply: 'Here are a few things I can help with:',
      department: null,
      options: menuFor(zone),
      showMenu: true,
    });
  }

  // --- "More options" chip: the visitor deliberately asked to see the
  // full zone menu again, instead of it being stacked under every reply
  // automatically. This is the one place a full menuFor(zone) is still
  // shown outside a greeting/courtesy ask. ---
  if (message === MORE_OPTIONS_VALUE) {
    return NextResponse.json({
      reply: 'Here are a few more things I can help with:',
      department: null,
      options: menuFor(zone),
      showMenu: true,
    });
  }

  const intent = personalIntent(text);

  if (intent) {
    if (!user) {
      return NextResponse.json({
        reply:
          "I can look that up once you're signed in — please log in first, then ask me again.",
        department: null,
        options: menuFor(zone),
      });
    }

    try {
      if (intent === 'orders') {
        const orders = await prisma.order.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { orderNumber: true, totalUSD: true, status: true, paymentStatus: true },
        });
        if (orders.length === 0) {
          return NextResponse.json({
            reply: "You don't have any orders yet.",
            department: 'Bookstore',
            options: relatedFor('orders', zone),
          });
        }
        const lines = orders
          .map((o) => `#${o.orderNumber} — $${Number(o.totalUSD).toFixed(2)} (${o.status}, payment ${o.paymentStatus})`)
          .join('\n');
        return NextResponse.json({
          reply: `Your ${orders.length} most recent order(s):\n${lines}`,
          department: 'Bookstore',
          options: relatedFor('orders', zone),
        });
      }

      if (intent === 'books') {
        const access = await prisma.bookAccess.findMany({
          where: { userId: user.id, revokedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: { book: { select: { titleEn: true } } },
        });
        if (access.length === 0) {
          return NextResponse.json({
            reply: "You don't have any approved books yet.",
            department: 'Bookstore',
            options: relatedFor('books', zone),
          });
        }
        const lines = access.map((a) => `• ${a.book.titleEn}`).join('\n');
        return NextResponse.json({
          reply: `Your approved books:\n${lines}\n\nDownload them from your Dashboard.`,
          department: 'Bookstore',
          options: relatedFor('books', zone),
        });
      }

      if (intent === 'requests') {
        const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
        if (!profile) {
          return NextResponse.json({
            reply: "I don't see a student record on your account, so there's nothing to show here.",
            department: null,
            options: relatedFor('requests', zone),
          });
        }
        const requests = await prisma.request.findMany({
          where: { studentId: profile.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { type: true, status: true, createdAt: true },
        });
        if (requests.length === 0) {
          return NextResponse.json({
            reply: "You don't have any submitted requests on file.",
            department: 'Student Affairs',
            options: relatedFor('requests', zone),
          });
        }
        const lines = requests
          .map((r) => `• ${r.type.replace(/_/g, ' ')} — ${r.status} (${new Date(r.createdAt).toLocaleDateString()})`)
          .join('\n');
        return NextResponse.json({
          reply: `Your recent requests:\n${lines}`,
          department: 'Student Affairs',
          options: relatedFor('requests', zone),
        });
      }

      if (intent === 'profile') {
        return NextResponse.json({
          reply: `You're signed in as ${user.name} (${user.email}).`,
          department: null,
          options: relatedFor('profile', zone),
        });
      }

      if (intent === 'staff-dashboard') {
        const destination = await getStaffDestination(user.id);
        if (!destination) {
          return NextResponse.json({
            reply:
              "I don't see a staff position on your account, so there's no staff dashboard to send you to. If that's not right, contact ICT or your supervisor.",
            department: null,
            options: relatedFor('staff-dashboard', zone),
          });
        }
        return NextResponse.json({
          reply: 'Here is your dashboard.',
          department: null,
          href: destination,
          options: relatedFor('staff-dashboard', zone),
        });
      }

      if (intent === 'admission-status') {
        const application = await prisma.admissionApplication.findFirst({
          where: { email: { equals: user.email, mode: 'insensitive' } },
          orderBy: { createdAt: 'desc' },
          select: { applicationNumber: true, status: true, programName: true },
        });
        if (!application) {
          return NextResponse.json({
            reply:
              "I couldn't find an admission application under your account email. If you applied using a different email address, use the Track Application page with your application number instead.",
            department: 'Admissions Office',
            options: relatedFor('admission-status', zone),
          });
        }
        const label = ADMISSION_STATUS_LABELS[application.status] || application.status;
        const programPart = application.programName ? ` for ${application.programName}` : '';
        return NextResponse.json({
          reply: `Your application ${application.applicationNumber}${programPart} is currently: ${label}.`,
          department: 'Admissions Office',
          options: relatedFor('admission-status', zone),
        });
      }

      if (intent === 'subscription-status') {
        const active = await prisma.userMediaSubscription.findFirst({
          where: { userId: user.id, status: 'ACTIVE', expiresAt: { gt: new Date() } },
          orderBy: { expiresAt: 'desc' },
          include: { plan: { select: { name: true } } },
        });
        if (active) {
          return NextResponse.json({
            reply: `You have an active ${active.plan.name} subscription, valid until ${new Date(active.expiresAt).toLocaleDateString()}.`,
            department: 'Media',
            options: relatedFor('subscription-status', zone),
          });
        }
        const latest = await prisma.userMediaSubscription.findFirst({
          where: { userId: user.id },
          orderBy: { startedAt: 'desc' },
          include: { plan: { select: { name: true } } },
        });
        if (!latest) {
          return NextResponse.json({
            reply: "You don't have a media subscription yet. You can view available plans on the Media page.",
            department: 'Media',
            options: relatedFor('subscription-status', zone),
          });
        }
        const label = SUBSCRIPTION_STATUS_LABELS[latest.status] || latest.status;
        return NextResponse.json({
          reply: `Your ${latest.plan.name} subscription is currently ${label}.`,
          department: 'Media',
          options: relatedFor('subscription-status', zone),
        });
      }
    } catch (err) {
      console.error('Assistant lookup error:', err);
      return NextResponse.json({
        reply: "Sorry, I couldn't retrieve that right now — please try again shortly.",
        department: null,
        options: menuFor(zone),
      });
    }
  }

  const match = matchKnowledge(text, zone);
  if (match) {
    await logAssistantEvent({ type: 'query_matched', zone, label: match.id });
    return NextResponse.json({
      reply: match.answer,
      department: match.department,
      href: match.href || null,
      options: relatedFor(match.id, zone),
    });
  }

  await logAssistantEvent({ type: 'query_unmatched', zone });
  return NextResponse.json({
    reply:
      "I couldn't find anything specific for that — here are a few things I can help with instead:",
    department: null,
    options: menuFor(zone),
  });
}
