import PublicLegalPageClient from '@/components/PublicLegalPageClient';

export const metadata = {
  title: 'Ulul Azm Community Guidelines | Ulul Azm Institute',
};

export default function CommunityGuidelinesPage() {
  return <PublicLegalPageClient slug="community-guidelines" fallbackTitle="Ulul Azm Community Guidelines" />;
}
