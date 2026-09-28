import PublicLegalPageClient from '@/components/PublicLegalPageClient';

export const metadata = {
  title: 'Refund Policy | Ulul Azm Institute',
};

export default function RefundPage() {
  return <PublicLegalPageClient slug="refund" fallbackTitle="Refund Policy" />;
}
