import PublicLegalPageClient from '@/components/PublicLegalPageClient';

export const metadata = {
  title: 'Privacy Policy | Ulul Azm Institute',
};

export default function PrivacyPage() {
  return <PublicLegalPageClient slug="privacy" fallbackTitle="Privacy Policy" />;
}
