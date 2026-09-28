import PublicLegalPageClient from '@/components/PublicLegalPageClient';

export const metadata = {
  title: 'About Ulul Azm | Ulul Azm Institute',
};

export default function AboutPage() {
  return <PublicLegalPageClient slug="about" fallbackTitle="About Ulul Azm" />;
}
