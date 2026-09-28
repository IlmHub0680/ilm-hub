import PublicLegalPageClient from '@/components/PublicLegalPageClient';

export const metadata = {
  title: 'Student Resources | Ulul Azm Institute',
};

export default function StudentResourcesPage() {
  return <PublicLegalPageClient slug="student-resources" fallbackTitle="Student Resources" />;
}
