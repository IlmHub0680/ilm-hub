"use client";

import { useState } from 'react';

export default function AuthorRegister() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/author/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-green-600">Application Submitted!</h1>
        <p className="mt-2">
          Your application to 'Sell Your Books' is pending admin approval. Once approved, you can log in to your author portal.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sell Your Books – Author Registration</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Submit Author Application
        </button>
      </form>
    </div>
  );
}
