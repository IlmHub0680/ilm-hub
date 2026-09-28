# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

path = "app/admin/analytics/page.tsx"
with io.open(path, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Fetch real AssistantEvent aggregates alongside the existing queries.
c = r1(
    c,
    "    prisma.newsletterSubscriber.count({ where: { isActive: true } }),\n  ]);",
    """    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.assistantEvent.count({ where: { type: 'open' } }),
    prisma.assistantEvent.count({ where: { type: 'query_matched' } }),
    prisma.assistantEvent.count({ where: { type: 'query_unmatched' } }),
    prisma.assistantEvent.groupBy({
      by: ['identity'],
      where: { type: 'identity_selected', identity: { not: null } },
      _count: { identity: true },
    }),
    prisma.assistantEvent.groupBy({
      by: ['label'],
      where: { type: 'quick_option', label: { not: null } },
      _count: { label: true },
      orderBy: { _count: { label: 'desc' } },
      take: 5,
    }),
  ]);""",
    "analytics: add AssistantEvent aggregate queries",
)

c = r1(
    c,
    """    activeNewsletterCount,
  ] = await Promise.all([""",
    """    activeNewsletterCount,
    assistantOpenCount,
    assistantMatchedCount,
    assistantUnmatchedCount,
    assistantIdentityBreakdown,
    assistantTopQuickOptions,
  ] = await Promise.all([""",
    "analytics: destructure AssistantEvent aggregate results",
)

# 2. A new, honestly-computed section (nothing here is a placeholder --
#    every tile is a real count or a real top-N from AssistantEvent).
c = r1(
    c,
    """    {
      title: 'Sponsorship & Community',
      tiles: [
        { label: 'Active Sponsors', value: String(activeSponsorCount) },
        { label: 'Active Sponsorship Value', value: money(sponsorshipTotal) },
        { label: 'Newsletter Subscribers', value: String(activeNewsletterCount) },
      ],
    },
  ];""",
    """    {
      title: 'Sponsorship & Community',
      tiles: [
        { label: 'Active Sponsors', value: String(activeSponsorCount) },
        { label: 'Active Sponsorship Value', value: money(sponsorshipTotal) },
        { label: 'Newsletter Subscribers', value: String(activeNewsletterCount) },
      ],
    },
    {
      title: 'AI Assistant',
      tiles: [
        { label: 'Assistant Opened', value: String(assistantOpenCount) },
        { label: 'Questions Answered', value: String(assistantMatchedCount) },
        { label: 'Questions Unanswered', value: String(assistantUnmatchedCount) },
        ...assistantIdentityBreakdown.map((row) => ({
          label: `Identity: ${row.identity}`,
          value: String(row._count.identity),
        })),
        ...assistantTopQuickOptions.map((row) => ({
          label: `Quick option: ${row.label}`,
          value: String(row._count.label),
        })),
      ],
    },
  ];""",
    "analytics: add AI Assistant tile section",
)

with io.open(path, "w", encoding="utf-8") as f:
    f.write(c)
print("app/admin/analytics/page.tsx: AI Assistant tile group added (real AssistantEvent aggregates).")
