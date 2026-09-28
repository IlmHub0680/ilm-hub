import PublicLegalPageClient from '@/components/PublicLegalPageClient';

export const metadata = {
  title: 'Academic Policies | Ulul Azm Institute',
};

export default function AcademicPoliciesPage() {
  return <PublicLegalPageClient slug="academic-policies" fallbackTitle="Academic Policies" />;
}
