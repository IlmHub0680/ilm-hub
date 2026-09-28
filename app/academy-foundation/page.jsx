import PublicLegalPageClient from '@/components/PublicLegalPageClient';

export const metadata = {
  title: 'Academy Foundation | Ulul Azm Institute',
};

export default function AcademyFoundationPage() {
  return (
    <PublicLegalPageClient
      slug="academy-foundation"
      fallbackTitle="Academy Foundation"
    />
  );
}
