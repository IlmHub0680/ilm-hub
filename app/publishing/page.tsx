import Link from 'next/link';

export default function PublishingServicesPage() {
  const services = [
    {
      title: "Editing",
      description: "Comprehensive developmental edits, copyediting, and proofreading to ensure your manuscript meets professional standards.",
      icon: "??",
    },
    {
      title: "Formatting",
      description: "Custom interior typesetting and layout design optimized for both print paperback/hardcover and standard e-book formats.",
      icon: "??",
    },
    {
      title: "Cover Design",
      description: "Bespoke front, spine, and back cover artwork tailored to your genre and market audience.",
      icon: "??",
    },
    {
      title: "PDF Publishing",
      description: "High-resolution digital publishing preparation, interactive indexing, and global distribution readiness.",
      icon: "??",
    },
    {
      title: "Marketing Assistance",
      description: "Tailored launch campaigns, press releases, social media kits, and promotional strategies for max impact.",
      icon: "??",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
          Book Publishing Services
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transform your raw manuscript into a world-class published work with our end-to-end editorial, design, and distribution services.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/publishing/request-quote"
            className="rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Request a Quote
          </Link>
          <Link
            href="/publishing/faq"
            className="rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Author FAQ
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {services.map((service, index) => (
          <div
            key={index}
            className="p-6 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-4">{service.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
        <h2 className="text-2xl font-bold text-indigo-950 mb-2">Ready to publish your work?</h2>
        <p className="text-indigo-800 mb-6">Submit your manuscript draft to receive a tailored service quote within 48 hours.</p>
        <Link
          href="/publishing/request-quote"
          className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500"
        >
          Submit Your Manuscript
        </Link>
      </div>
    </div>
  );
}
