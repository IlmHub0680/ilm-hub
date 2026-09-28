import PublicLegalPageClient from '@/components/PublicLegalPageClient';

export const metadata = {
  title: 'Academy Pathways | Ulul Azm Institute',
};

export default function AcademyPathwaysPage() {
  return (
    <PublicLegalPageClient
      slug="academy-pathways"
      fallbackTitle="Academy Pathways"
    />
  );
}
