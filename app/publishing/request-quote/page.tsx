'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RequestQuotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<string[]>([]);

  const availableServices = [
    'Editing',
    'Formatting',
    'Cover Design',
    'PDF Publishing',
    'Marketing Assistance',
  ];

  const handleCheckboxChange = (service: string) => {
    setServices((prev) =>
      prev.includes(service)
        ? prev.filter((item) => item !== service)
        : [...prev, service]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get('title'),
      genre: formData.get('genre'),
      description: formData.get('description'),
      manuscriptUrl: formData.get('manuscriptUrl'),
      services,
    };

    try {
      const res = await fetch('/api/publishing/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Manuscript submitted successfully!');
        router.push('/author/dashboard');
      } else {
        alert('Failed to submit manuscript. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Request a Publishing Quote</h1>
        <p className="text-gray-600">
          Provide your manuscript details and select the services you require. Our editorial team will review your submission and generate a custom proposal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
          <input
            type="text"
            name="title"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. Guidance for the Modern Era"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Genre / Category</label>
          <input
            type="text"
            name="genre"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. Theology, History, Biography, Educational"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Book Description / Synopsis</label>
          <textarea
            name="description"
            rows={4}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Brief summary of your manuscript..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manuscript Link (Google Drive / Dropbox / Cloud Storage)</label>
          <input
            type="url"
            name="manuscriptUrl"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="https://drive.google.com/file/d/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Publishing Services Required</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableServices.map((service) => (
              <label key={service} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={services.includes(service)}
                  onChange={() => handleCheckboxChange(service)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">{service}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-indigo-500 transition-colors disabled:opacity-50"
        >
          {loading ? 'Submitting Submission...' : 'Submit Manuscript for Quote'}
        </button>
      </form>
    </div>
  );
}
