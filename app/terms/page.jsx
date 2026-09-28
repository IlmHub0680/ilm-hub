import PublicLegalPageClient from '@/components/PublicLegalPageClient';

export const metadata = {
  title: 'Terms of Use | Ulul Azm Institute',
};

export default function TermsPage() {
  return <PublicLegalPageClient slug="terms" fallbackTitle="Terms of Use" />;
}
