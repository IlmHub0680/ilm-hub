import PublicLegalPageClient from '@/components/PublicLegalPageClient';

export const metadata = {
  title: 'Admission Requirements | Ulul Azm Institute',
};

export default function AdmissionRequirementsPage() {
  return (
    <PublicLegalPageClient
      slug="admission-requirements"
      fallbackTitle="Admission Requirements"
    />
  );
}
