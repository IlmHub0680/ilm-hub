'use client';

import { useState } from 'react';

export default function NewsletterManager() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Book');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch('/api/newsletter/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, category, content }),
      });

      if (res.ok) {
        alert('Campaign broadcast sent to all active subscribers!');
        setSubject('');
        setContent('');
      } else {
        alert('Failed to send campaign.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Newsletter & Broadcast Manager</h1>
        <p className="text-gray-600">Create and dispatch email announcements to your audience.</p>
      </div>

      <form onSubmit={handleSendCampaign} className="bg-white p-8 border border-gray-200 rounded-xl shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Subject</label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="e.g. New Book Launch: Guidance for the Modern Era"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="Book">Book Release</option>
            <option value="Course">Course Announcement</option>
            <option value="Sponsored">Sponsored Update</option>
            <option value="Community">Community Announcement</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Body Content</label>
          <textarea
            rows={8}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Write your email broadcast content here..."
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-md hover:bg-indigo-500 transition-colors disabled:opacity-50"
        >
          {sending ? 'Dispatching Broadcast...' : 'Send Campaign Broadcast'}
        </button>
      </form>
    </div>
  );
}
