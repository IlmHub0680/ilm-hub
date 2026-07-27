'use client';

import { useState } from 'react';
import Link from 'next/link';

const booksData = [
  {
    id: '1',
    slug: 'book-title-1',
    title: 'Book Title 1',
    arabicTitle: 'كتاب التوحيد وشرحه',
    author: 'Shaykh Muhammad Ibn Abdulwahhab',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    slug: 'book-title-2',
    title: 'Book Title 2',
    arabicTitle: 'رياض الصالحين',
    author: 'Imam An-Nawawi',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3',
    slug: 'book-title-3',
    title: 'Book Title 3',
    arabicTitle: 'الإحكام في أصول الأحكام',
    author: 'Ibn Hazm Al-Andalusi',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '4',
    slug: 'book-title-4',
    title: 'Book Title 4',
    arabicTitle: 'زاد المعاد في هدي خير العباد',
    author: 'Ibn Al-Qayyim',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80',
  },
];

export default function BooksPage() {
  const [cartMessage, setCartMessage] = useState('');

  const handleBuy = (bookTitle) => {
    setCartMessage('Successfully added "' + bookTitle + '" to your checkout cart!');
    setTimeout(() => setCartMessage(''), 4000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            ← Back to Home
          </Link>
          <Link
            href="/courses"
            style={{
              color: '#059669',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            View Study Courses →
          </Link>
        </div>

        {cartMessage && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #10b981',
            color: '#065f46',
            padding: '12px 20px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            {cartMessage}
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>
            Purchase Islamic Books
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#4b5563', maxWidth: '600px', margin: '0 auto' }}>
            Explore our curated collection of authentic Islamic literature available for digital purchase and download.
          </p>
        </div>

        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: '30px' }}>
            Featured Books
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {booksData.map((book) => (
              <div key={book.id} style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ position: 'relative', height: '220px', width: '100%', backgroundColor: '#e6f4ea' }}>
                  <img
                    src={book.image}
                    alt={book.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    ${book.price}
                  </span>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: '1', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>
                      {book.title}
                    </h3>
                    <p style={{ color: '#047857', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 8px 0' }}>
                      {book.arabicTitle}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0' }}>
                      Author: {book.author}
                    </p>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <button
                      onClick={() => handleBuy(book.title)}
                      style={{
                        width: '100%',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        fontWeight: '600',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          backgroundColor: '#e6f4ea',
          borderRadius: '16px',
          padding: '40px 20px',
          textAlign: 'center',
          border: '1px solid #d1fae5'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#064e3b', marginBottom: '30px' }}>
            How It Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div style={{ padding: '15px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', marginBottom: '8px' }}>1</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827', margin: '0 0 6px 0' }}>Browse</h3>
              <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0' }}>Explore our collection</p>
            </div>
            <div style={{ padding: '15px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', marginBottom: '8px' }}>2</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827', margin: '0 0 6px 0' }}>Select</h3>
              <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0' }}>Choose what you want</p>
            </div>
            <div style={{ padding: '15px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', marginBottom: '8px' }}>3</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827', margin: '0 0 6px 0' }}>Checkout</h3>
              <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0' }}>Complete payment</p>
            </div>
            <div style={{ padding: '15px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', marginBottom: '8px' }}>4</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827', margin: '0 0 6px 0' }}>Download</h3>
              <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0' }}>Access your books</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}