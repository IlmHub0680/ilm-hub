import Link from 'next/link';

export default function AuthorFAQPage() {
  const faqs = [
    {
      question: "How long does it take to get a quote?",
      answer: "Once you submit your manuscript through our Request a Quote page, our editorial team reviews the word count, technical complexity, and selected services. You will receive a quote within 48 hours."
    },
    {
      question: "Do I retain the rights to my book?",
      answer: "Yes, 100%. You retain full copyright and ownership of your work. We are a service provider and do not claim ownership of your intellectual property."
    },
    {
      question: "What file formats should I submit for editing or design?",
      answer: "For initial submissions and editing, Microsoft Word (.docx) files are preferred. If you are requesting PDF layout or typesetting only, clean text or existing drafts can be attached via Google Drive or Dropbox link."
    },
    {
      question: "How does the revision process work?",
      answer: "After an editor is assigned, you will be able to review initial drafts directly on your Author Dashboard. You can upload revisions and leave notes for your editor at any stage during production."
    },
    {
      question: "Can I request individual services, like cover design only?",
      answer: "Absolutely! You can select any combination of services—whether you need individual cover design, full editorial layout, formatting, or marketing packages."
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Author FAQ & Publishing Guide</h1>
        <p className="text-lg text-gray-600">
          Everything you need to know about our editing, formatting, cover design, and publishing process.
        </p>
      </div>

      <div className="space-y-6 mb-12">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-8 text-center">
        <h3 className="text-xl font-bold text-indigo-950 mb-2">Have a specific question about your manuscript?</h3>
        <p className="text-indigo-800 text-sm mb-6">Submit a request quote with your manuscript details and our team will get back to you directly.</p>
        <Link
          href="/publishing/request-quote"
          className="inline-block bg-indigo-600 text-white text-sm font-semibold px-6 py-3 rounded-md hover:bg-indigo-500 transition-colors"
        >
          Submit Your Manuscript
        </Link>
      </div>
    </div>
  );
}
