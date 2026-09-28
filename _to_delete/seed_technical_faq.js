// One-off data fix -- run ONCE against the real database, AFTER the
// 20260918050000_add_faq_category migration has been applied:
//   node _to_delete/seed_technical_faq.js
//
// Seeds 5 real Technical Support FAQ questions (category: 'technical')
// so /it-support has real content immediately, matching
// lib/legalContentDefaults.js's DEFAULT_FAQS_TECHNICAL. The existing
// general FAQ rows (category defaults to 'general' via the migration)
// are untouched -- this script only ever creates/updates rows with
// these specific ids. Safe to run more than once.
import 'dotenv/config';
import { prisma } from '../lib/prisma.js';

const technicalFaqs = [
  {
    id: 'faq-tech-forgot-password',
    question: 'I forgot my password. How do I get back into my account?',
    answer: 'Use the "Forgot your password?" link on the Student Portal login page to reset it by email, then log in again with your new password.',
    order: 100,
  },
  {
    id: 'faq-tech-login-trouble',
    question: "I'm having trouble logging in to the Student Portal.",
    answer: "Double-check that you're using the email address and password you registered with. If you can't remember your password, use the password reset option on the login page. If you still can't get in, reach us through the Contact page and we'll help you regain access.",
    order: 101,
  },
  {
    id: 'faq-tech-upload-failing',
    question: 'My document upload keeps failing during admission or registration.',
    answer: 'Each uploaded document must be under 10MB. If a file is larger, try compressing it or saving it at a lower resolution/quality, then upload it again.',
    order: 102,
  },
  {
    id: 'faq-tech-site-broken',
    question: "The website isn't displaying properly or a page seems stuck.",
    answer: "Try refreshing the page, or clearing your browser's cache and reloading. If the issue continues, let us know through the Contact page so our team can look into it.",
    order: 103,
  },
  {
    id: 'faq-tech-contact',
    question: "Who do I contact for technical help if my issue isn't listed here?",
    answer: "Reach our team through the Contact page for any technical issue not covered above, and we'll follow up as soon as possible.",
    order: 104,
  },
];

async function main() {
  for (const item of technicalFaqs) {
    await prisma.faqItem.upsert({
      where: { id: item.id },
      update: {
        question: item.question,
        answer: item.answer,
        category: 'technical',
        order: item.order,
        isActive: true,
      },
      create: {
        id: item.id,
        question: item.question,
        answer: item.answer,
        category: 'technical',
        order: item.order,
        isActive: true,
      },
    });
    console.log('  \u2713 Technical FAQ:', item.question);
  }

  console.log('');
  console.log('Done -- /it-support now has 5 real technical-support questions. Edit them anytime at /admin/legal-pages/faq (set a question\'s category to "Technical Support").');
}

main()
  .catch((error) => {
    console.error('FAILED:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
