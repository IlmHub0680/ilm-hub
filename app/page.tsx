import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#14532d] text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Excellence in Islamic Studies & Qur'anic Sciences
        </h1>
        <p className="max-w-2xl mx-auto mb-8 text-gray-200">
          Empowering students worldwide with authentic foundational knowledge, structured curricula, expert instruction, and digital resources.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/admission"
            className="bg-[#16a34a] hover:bg-[#15803d] text-white px-6 py-2.5 rounded-md font-medium transition"
          >
            Apply For Admission
          </Link>
          <Link
            href="/author-portal/register"
            className="border border-white hover:bg-white/10 text-white px-6 py-2.5 rounded-md font-medium transition"
          >
            Sell Your Books
          </Link>
          <Link
            href="/admin"
            className="border border-white hover:bg-white/10 text-white px-6 py-2.5 rounded-md font-medium transition"
          >
            Admin Portal
          </Link>
        </div>
      </section>
    </main>
  );
}
