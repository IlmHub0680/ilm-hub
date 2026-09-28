import { redirect } from 'next/navigation';

export default function LegalPagesIndex() {
  redirect('/admin/legal-pages/about');
}
