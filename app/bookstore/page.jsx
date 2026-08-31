'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import BookCard from '@/components/bookstore/BookCard';
import CartDrawer from '@/components/bookstore/CartDrawer';
import { currencies, formatPrice } from '@/lib/bookstore';

const CART_KEY = 'ilmhub-cart';
const CURRENCY_KEY = 'ilmhub-currency';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85';

function getCategoryName(category) {
  if (!category) return 'General';

  if (typeof category === 'string') {
    return category;
  }

  return (
    category.nameEn ||
    category.nameAr ||
    category.name ||
    category.slug ||
    'General'
  );
}

function getBookImage(book) {
  return (
    book?.image ||
    book?.coverImage ||
    book?.coverUrl ||
    book?.thumbnail ||
    FALLBACK_COVER
  );
}

function cleanText(value) {
  if (value == null) return '';

  if (typeof value === 'string') {
    return value
      .replace(/âœ¦/g, '✦')
      .replace(/âœ“/g, '✓')
      .replace(/â†’/g, '→')
      .replace(/â€”/g, '—')
      .replace(/â€“/g, '–')
      .replace(/ðŸ›’/g, '🛒')
      .replace(/ðŸ“š/g, '📚')
      .replace(/ðŸ”/g, '🔒')
      .replace(/ðŸ“±/g, '📱')
      .replace(/ðŸŒ/g, '🌍')
      .replace(/âŒ•/g, '⌕')
      .replace(/Ã—/g, '×')
      .replace(/â˜°/g, '☰')
      .replace(/Ø¹/g, 'ع');
  }

  return String(value);
}

export default function BookstorePage() {
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [currency, setCurrency] = useState('USD');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      try {
        setLoadingBooks(true);
        setBooksError('');

        const response = await fetch('/api/bookstore/books', {
          method: 'GET',
          cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || 'Unable to retrieve books.'
          );
        }

        const formattedBooks = Array.isArray(data?.books)
          ? data.books.map((book) => {
              const categoryName = getCategoryName(
                book.category || book.Category
              );

              return {
                ...book,

                id: book.id,
                slug: book.slug || book.id,

                title: cleanText(book.title),
                arabicTitle: cleanText(
                  book.arabicTitle ||
                    book.titleAr ||
                    book.nameAr
                ),

                image: getBookImage(book),

                author: cleanText(
                  typeof book.author === 'object'
                    ? book.author?.name ||
                        book.author?.nameEn ||
                        'Ilm-Hub Academic Collection'
                    : book.author ||
                        book.authorName ||
                        'Ilm-Hub Academic Collection'
                ),

                category: categoryName,

                format: cleanText(
                  book.format || 'Book'
                ),

                description: cleanText(
                  book.description
                ),

                price: Number(
                  book.price ??
                    book.total ??
                    0
                ),

                oldPrice:
                  book.oldPrice != null
                    ? Number(book.oldPrice)
                    : null,

                rating: Number(
                  book.rating ?? 0
                ),

                reviews: Number(
                  book.reviews ?? 0
                ),

                badge: cleanText(
                  book.badge
                ) || null,

                currency:
                  book.currency || 'USD',
              };
            })
          : [];

        if (!cancelled) {
          setBooks(formattedBooks);
        }
      } catch (error) {
        console.error(
          'BOOKSTORE LOAD ERROR:',
          error
        );

        if (!cancelled) {
          setBooksError(
            error?.message ||
              'Unable to retrieve books.'
          );
          setBooks([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingBooks(false);
        }
      }
    }

    loadBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem(CART_KEY);

      const savedCurrency =
        localStorage.getItem(
          CURRENCY_KEY
        );

      if (savedCart) {
        const parsed =
          JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }

      if (
        savedCurrency &&
        currencies[savedCurrency]
      ) {
        setCurrency(savedCurrency);
      }
    } catch (error) {
      console.error(
        'BOOKSTORE STATE RESTORE ERROR:',
        error
      );
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
      );
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(
        CURRENCY_KEY,
        currency
      );
    } catch {}
  }, [currency]);

  const categoryOptions = useMemo(() => {
    const values = books
      .map((book) =>
        getCategoryName(book.category)
      )
      .filter(Boolean);

    return [
      'All',
      ...Array.from(
        new Set(values)
      ),
    ];
  }, [books]);

  const filteredBooks = useMemo(() => {
    let result = [...books];

    const term =
      search.trim().toLowerCase();

    if (category !== 'All') {
      result = result.filter(
        (book) =>
          getCategoryName(
            book.category
          ) === category
      );
    }

    if (term) {
      result = result.filter(
        (book) => {
          const searchable = [
            book.title,
            book.arabicTitle,
            book.author,
            getCategoryName(
              book.category
            ),
            book.format,
            book.description,
          ]
            .map(cleanText)
            .join(' ')
            .toLowerCase();

          return searchable.includes(term);
        }
      );
    }

    if (sort === 'price-low') {
      result.sort(
        (a, b) =>
          Number(a.price) -
          Number(b.price)
      );
    }

    if (sort === 'price-high') {
      result.sort(
        (a, b) =>
          Number(b.price) -
          Number(a.price)
      );
    }

    if (sort === 'rating') {
      result.sort(
        (a, b) =>
          Number(b.rating) -
            Number(a.rating) ||
          Number(b.reviews) -
            Number(a.reviews)
      );
    }

    return result;
  }, [
    books,
    search,
    category,
    sort,
  ]);

  function addToCart(book) {
    setCart((current) => {
      const existing =
        current.find(
          (item) =>
            item.id === book.id
        );

      if (existing) {
        return current.map(
          (item) =>
            item.id === book.id
              ? {
                  ...item,
                  quantity:
                    Number(
                      item.quantity || 0
                    ) + 1,
                }
              : item
        );
      }

      return [
        ...current,
        {
          ...book,
          quantity: 1,
        },
      ];
    });

    setCartOpen(true);
  }

  function removeFromCart(id) {
    setCart((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  }

  function changeQuantity(
    id,
    amount
  ) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  Number(
                    item.quantity || 0
                  ) + amount,
              }
            : item
        )
        .filter(
          (item) =>
            Number(
              item.quantity
            ) > 0
        )
    );
  }

  const cartCount = cart.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0),
    0
  );

  return (
    <main className="bookstore">
      <div className="announcement">
        <div className="container announcement-inner">
          <span>
            ✦ Carefully selected Islamic books
            for students of knowledge
          </span>

          <span className="announcement-right">
            Secure checkout · Digital books
          </span>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <Link
            href="/"
            className="brand"
          >
            <div className="brand-logo">
              ع
            </div>

            <div>
              <strong>Ilm-Hub</strong>

              <small>
                Academic Bookstore
              </small>
            </div>
          </Link>

          <nav
            className={
              mobileMenu
                ? 'main-nav mobile-open'
                : 'main-nav'
            }
          >
            <Link href="/">
              Home
            </Link>

            <Link
              href="/bookstore"
              className="active"
            >
              Bookstore
            </Link>

            <Link href="/lectures">
              Lectures Library
            </Link>

            <Link href="/programs">
              Academics
            </Link>
          </nav>

          <div className="header-actions">
            <select
              value={currency}
              onChange={(event) =>
                setCurrency(
                  event.target.value
                )
              }
              aria-label="Select currency"
            >
              <option value="USD">
                USD — US Dollar
              </option>

              <option value="GHS">
                GHS — Ghanaian Cedi
              </option>
            </select>

            <Link
              href="/login"
              className="login-link"
            >
              Login
            </Link>

            <button
              type="button"
              className="cart-button"
              onClick={() =>
                setCartOpen(true)
              }
            >
              🛒

              <span>Cart</span>

              {cartCount > 0 && (
                <b>{cartCount}</b>
              )}
            </button>

            <button
              type="button"
              className="menu-button"
              onClick={() =>
                setMobileMenu(
                  (value) => !value
                )
              }
              aria-label="Toggle navigation"
            >
              {mobileMenu
                ? '×'
                : '☰'}
            </button>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-pattern" />

        <div className="hero-content">
          <span className="eyebrow">
            ILM-HUB ACADEMIC BOOKSTORE
          </span>

          <h1>
            Books that accompany
            <br />
            the journey of knowledge.
          </h1>

          <p>
            Discover carefully selected Islamic
            literature, classical works, academic
            texts and student resources for every
            stage of learning.
          </p>

          <div className="hero-search">
            <span>⌕</span>

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search books, authors, subjects or Arabic titles..."
            />

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById(
                    'collection'
                  )
                  ?.scrollIntoView({
                    behavior: 'smooth',
                  })
              }
            >
              Search
            </button>
          </div>

          <div className="hero-trust">
            <span>
              ✓ Curated Islamic literature
            </span>

            <span>
              ✓ Secure checkout
            </span>

            <span>
              ✓ Digital editions
            </span>
          </div>
        </div>
      </section>

      <section className="category-section">
        <div className="container">
          <div className="category-heading">
            <div>
              <span className="gold-label">
                EXPLORE
              </span>

              <h2>
                Browse by discipline
              </h2>
            </div>

            <span>
              {filteredBooks.length} books
            </span>
          </div>

          <div className="category-list">
            {categoryOptions.map(
              (item) => (
                <button
                  type="button"
                  key={item}
                  className={
                    category === item
                      ? 'category active'
                      : 'category'
                  }
                  onClick={() =>
                    setCategory(item)
                  }
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="gold-label">
                EDITOR'S SELECTION
              </span>

              <h2>
                Featured Books
              </h2>

              <p>
                Distinguished works selected
                for serious students and readers.
              </p>
            </div>

            <Link href="#collection">
              View collection →
            </Link>
          </div>

          <div className="featured-grid">
            {loadingBooks ? (
              <div className="empty-state">
                <h3>
                  Loading books...
                </h3>

                <p>
                  Please wait while we retrieve
                  the bookstore collection.
                </p>
              </div>
            ) : booksError ? (
              <div className="empty-state">
                <h3>
                  Unable to retrieve books
                </h3>

                <p>
                  {booksError}
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  Try Again
                </button>
              </div>
            ) : books.length === 0 ? (
              <div className="empty-state">
                <div>📚</div>

                <h3>
                  No books available
                </h3>

                <p>
                  The bookstore collection is
                  currently empty.
                </p>
              </div>
            ) : (
              books
                .slice(0, 4)
                .map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    currency={currency}
                    formatPrice={formatPrice}
                    onAdd={addToCart}
                  />
                ))
            )}
          </div>
        </div>
      </section>

      <section className="value-strip">
        <div className="container value-grid">
          <Value
            icon="📚"
            title="Curated Collection"
            text="Selected literature for meaningful Islamic study."
          />

          <Value
            icon="🔒"
            title="Secure Checkout"
            text="Protected online payment and order processing."
          />

          <Value
            icon="📱"
            title="Digital Access"
            text="Selected publications available in digital format."
          />

          <Value
            icon="🌍"
            title="Learning Without Borders"
            text="Resources designed for students wherever they are."
          />
        </div>
      </section>

      <section
        id="collection"
        className="section collection-section"
      >
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="gold-label">
                THE COLLECTION
              </span>

              <h2>
                Islamic Books
              </h2>
            </div>

            <select
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value
                )
              }
              className="sort-select"
            >
              <option value="featured">
                Featured
              </option>

              <option value="rating">
                Highest Rated
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>
            </select>
          </div>

          <div className="collection-layout">
            <aside className="filter-panel">
              <strong>
                Refine Collection
              </strong>

              <span className="filter-label">
                Discipline
              </span>

              {categoryOptions.map(
                (item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() =>
                      setCategory(item)
                    }
                    className={
                      category === item
                        ? 'filter active'
                        : 'filter'
                    }
                  >
                    {item}
                  </button>
                )
              )}

              <hr />

              <p>
                Search by title, author,
                subject, format or Arabic title.
              </p>
            </aside>

            <div>
              {filteredBooks.length === 0 ? (
                <div className="empty-state">
                  <div>📚</div>

                  <h3>
                    No books found
                  </h3>

                  <p>
                    Try another search term or
                    category.
                  </p>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      setSearch('');
                      setCategory('All');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="book-grid">
                  {filteredBooks.map(
                    (book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        currency={currency}
                        formatPrice={formatPrice}
                        onAdd={addToCart}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="publisher-section">
        <div className="publisher-inner">
          <div>
            <span className="gold-label light">
              AUTHORS & PUBLISHERS
            </span>

            <h2>
              Have a book to publish?
            </h2>

            <p>
              Ilm-Hub welcomes authors and
              publishers whose works contribute
              to beneficial Islamic knowledge.
            </p>
          </div>

          <Link href="/author-portal/admission">
            Submit Your Book →
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <div>ع</div>

                <strong>
                  Ilm-Hub Institute

                  <small>
                    Academic Bookstore
                  </small>
                </strong>
              </div>

              <p>
                A dedicated academic bookstore
                providing beneficial Islamic
                literature, classical texts and
                educational resources.
              </p>
            </div>

            <div>
              <h3>Bookstore</h3>

              <Link href="#collection">
                All Books
              </Link>

              <Link href="#collection">
                Featured
              </Link>

              <Link href="#collection">
                New Arrivals
              </Link>

              <Link href="/author-portal/admission">
                Sell Your Books
              </Link>
            </div>

            <div>
              <h3>Ilm-Hub</h3>

              <Link href="/">
                Home
              </Link>

              <Link href="/programs">
                Academics
              </Link>

              <Link href="/lectures">
                Lectures
              </Link>

              <Link href="/admission">
                Admissions
              </Link>
            </div>

            <div>
              <h3>Support</h3>

              <span>
                info@ilmhub.org
              </span>

              <span>
                bookstore@ilmhub.org
              </span>

              <span>
                Monday – Friday
              </span>

              <span>
                8:00 AM – 5:00 PM
              </span>
            </div>
          </div>

          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()}
              {' '}Ilm-Hub Institute. All rights
              reserved.
            </span>

            <span>
              Knowledge is a trust. Character
              is its companion.
            </span>
          </div>
        </div>
      </footer>

      <CartDrawer
        open={cartOpen}
        cart={cart}
        currency={currency}
        formatPrice={formatPrice}
        onClose={() =>
          setCartOpen(false)
        }
        onRemove={removeFromCart}
        onChangeQuantity={
          changeQuantity
        }
      />

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #f8fafc;
        }

        button,
        input,
        select {
          font: inherit;
        }

        .bookstore {
          min-height: 100vh;
          color: #172033;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .container {
          width: 100%;
          max-width: 1220px;
          margin: auto;
          padding: 0 24px;
        }

        .announcement {
          background:
            linear-gradient(
              90deg,
              #031f10,
              #0b3b21,
              #031f10
            );
          color: #d7e4dc;
          font-size: 12px;
        }

        .announcement-inner {
          min-height: 38px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .announcement-right {
          color: #c8a866;
        }

        .site-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(
            255,
            255,
            255,
            0.97
          );
          border-bottom: 1px solid #e5e7eb;
          backdrop-filter: blur(15px);
        }

        .header-inner {
          min-height: 74px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #0b3b21;
          text-decoration: none;
          flex-shrink: 0;
        }

        .brand-logo {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background:
            linear-gradient(
              135deg,
              #06351b,
              #17633a
            );
          border: 1px solid #c59d5f;
          color: #d7b76d;
          font:
            bold 24px
            Georgia,
            serif;
        }

        .brand strong {
          display: block;
          font-size: 20px;
        }

        .brand small {
          display: block;
          margin-top: 2px;
          color: #a16207;
          font-size: 9px;
          letter-spacing: 1.3px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .main-nav {
          flex: 1;
          display: flex;
          justify-content: center;
          gap: 4px;
        }

        .main-nav a {
          padding: 9px 12px;
          color: #475569;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          border-radius: 7px;
        }

        .main-nav a:hover,
        .main-nav a.active {
          color: #0b3b21;
          background: #f0fdf4;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-actions select,
        .sort-select {
          border: 1px solid #dbe4df;
          background: white;
          color: #0b3b21;
          border-radius: 8px;
          padding: 9px 10px;
          font-size: 12px;
          font-weight: 800;
        }

        .login-link {
          color: #0b3b21;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
          padding: 9px;
        }

        .cart-button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 5px;
          border: 1px solid #dbe4df;
          background: white;
          color: #0b3b21;
          border-radius: 8px;
          padding: 9px 12px;
          cursor: pointer;
          font-weight: 800;
        }

        .cart-button b {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #c59d5f;
          color: #052e16;
          font-size: 10px;
        }

        .menu-button {
          display: none;
          width: 40px;
          height: 40px;
          border: 1px solid #dbe4df;
          background: white;
          color: #0b3b21;
          border-radius: 8px;
          font-size: 20px;
          cursor: pointer;
        }

        .hero {
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              #031f10,
              #0b3b21 55%,
              #14532d
            );
          color: white;
        }

        .hero-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.07;
          background-image:
            linear-gradient(
              30deg,
              #c59d5f 12%,
              transparent 12.5%,
              transparent 87%,
              #c59d5f 87.5%,
              #c59d5f
            ),
            linear-gradient(
              150deg,
              #c59d5f 12%,
              transparent 12.5%,
              transparent 87%,
              #c59d5f 87.5%,
              #c59d5f
            );
          background-size: 80px 140px;
        }

        .hero-content {
          position: relative;
          max-width: 900px;
          margin: auto;
          padding: 100px 24px 90px;
          text-align: center;
        }

        .eyebrow,
        .gold-label {
          color: #d7b76d;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .hero h1 {
          margin: 20px 0;
          font:
            68px/1.04
            Georgia,
            serif;
          letter-spacing: -2px;
        }

        .hero p {
          max-width: 680px;
          margin: 0 auto 35px;
          color: #d9e8df;
          line-height: 1.8;
          font-size: 17px;
        }

        .hero-search {
          max-width: 720px;
          margin: auto;
          display: flex;
          align-items: center;
          background: white;
          border-radius: 12px;
          padding: 6px;
          box-shadow:
            0 20px 60px
              rgba(0, 0, 0, 0.22);
        }

        .hero-search span {
          color: #64748b;
          padding: 0 12px;
          font-size: 27px;
        }

        .hero-search input {
          min-width: 0;
          flex: 1;
          border: 0;
          outline: 0;
          color: #172033;
          padding: 13px 4px;
        }

        .hero-search button {
          border: 0;
          background: #0b3b21;
          color: white;
          border-radius: 8px;
          padding: 12px 20px;
          font-weight: 800;
          cursor: pointer;
        }

        .hero-trust {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 25px;
          color: #bfd1c7;
          font-size: 12px;
        }

        .category-section {
          padding: 30px 0;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .category-heading,
        .section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
        }

        .category-heading {
          margin-bottom: 20px;
        }

        .category-heading h2,
        .section-heading h2 {
          margin: 7px 0 0;
          color: #123b26;
          font:
            32px
            Georgia,
            serif;
        }

        .category-heading > span {
          color: #64748b;
          font-size: 13px;
        }

        .category-list {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 3px;
        }

        .category {
          flex-shrink: 0;
          border: 1px solid #dbe4df;
          background: white;
          color: #475569;
          border-radius: 30px;
          padding: 9px 17px;
          cursor: pointer;
          font-weight: 700;
        }

        .category.active {
          background: #0b3b21;
          border-color: #0b3b21;
          color: white;
        }

        .section {
          padding: 75px 0;
          background: #f8fafc;
        }

        .section-heading {
          margin-bottom: 35px;
        }

        .section-heading h2 {
          font-size: 43px;
        }

        .section-heading p {
          margin-bottom: 0;
          color: #64748b;
        }

        .section-heading > a {
          color: #0b3b21;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
        }

        .featured-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .book-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .book-card {
          overflow: hidden;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          box-shadow:
            0 8px 30px
              rgba(15, 23, 42, 0.045);
        }

        .book-image-wrap {
          position: relative;
          height: 275px;
          overflow: hidden;
          background: #ecfdf5;
        }

        .book-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition:
            transform 0.3s ease;
        }

        .book-card:hover .book-image {
          transform: scale(1.04);
        }

        .book-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 5px 8px;
          border-radius: 5px;
          background: #c59d5f;
          color: #052e16;
          font-size: 9px;
          font-weight: 900;
        }

        .quick-view {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          padding: 9px;
          border-radius: 7px;
          background: rgba(
            255,
            255,
            255,
            0.95
          );
          color: #0b3b21;
          text-align: center;
          text-decoration: none;
          font-weight: 800;
        }

        .book-body {
          padding: 18px;
        }

        .book-meta {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          color: #a16207;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .book-title {
          display: block;
          margin: 10px 0 4px;
          color: #172033;
          font-size: 17px;
          font-weight: 800;
          text-decoration: none;
        }

        .book-arabic {
          margin: 0 0 7px;
          color: #047857;
          font:
            14px
            Georgia,
            serif;
        }

        .book-author {
          margin: 0;
          color: #64748b;
          font-size: 12px;
        }

        .book-rating {
          display: flex;
          gap: 7px;
          margin-top: 12px;
          color: #c59d5f;
          font-size: 13px;
        }

        .book-rating small {
          color: #64748b;
        }

        .book-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 15px;
          padding-top: 14px;
          border-top: 1px solid #edf0f2;
        }

        .book-bottom strong {
          color: #0b3b21;
          font-size: 18px;
        }

        .book-bottom del {
          margin-left: 7px;
          color: #94a3b8;
          font-size: 11px;
        }

        .add-button {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 8px;
          background: #0b3b21;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }

        .value-strip {
          padding: 28px 0;
          background: #0b3b21;
          color: white;
        }

        .value-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 20px;
        }

        .value {
          display: flex;
          gap: 12px;
        }

        .value-icon {
          font-size: 25px;
        }

        .value strong {
          font-size: 13px;
        }

        .value p {
          margin: 4px 0 0;
          color: #bcd0c5;
          font-size: 11px;
          line-height: 1.6;
        }

        .collection-section {
          padding-top: 70px;
        }

        .sort-select {
          color: #334155;
        }

        .collection-layout {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 30px;
        }

        .filter-panel {
          position: sticky;
          top: 95px;
          align-self: start;
          display: flex;
          flex-direction: column;
          padding: 20px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .filter-panel strong {
          color: #123b26;
          margin-bottom: 20px;
        }

        .filter-label {
          margin-bottom: 6px;
          color: #a16207;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .filter {
          padding: 7px 0;
          border: 0;
          background: transparent;
          color: #64748b;
          text-align: left;
          cursor: pointer;
        }

        .filter.active {
          color: #0b3b21;
          font-weight: 900;
        }

        .filter-panel hr {
          width: 100%;
          margin: 20px 0;
          border: 0;
          border-top: 1px solid #e5e7eb;
        }

        .filter-panel p {
          margin: 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
        }

        .empty-state {
          grid-column: 1 / -1;
          padding: 70px 20px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 15px;
          text-align: center;
        }

        .empty-state > div {
          font-size: 40px;
        }

        .primary-button {
          display: inline-block;
          border: 0;
          border-radius: 8px;
          background: #0b3b21;
          color: white;
          padding: 12px 20px;
          font-weight: 800;
          cursor: pointer;
        }

        .publisher-section {
          background:
            linear-gradient(
              135deg,
              #062b17,
              #14532d
            );
          color: white;
        }

        .publisher-inner {
          max-width: 1220px;
          margin: auto;
          padding: 65px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .publisher-inner h2 {
          margin: 8px 0;
          font:
            38px
            Georgia,
            serif;
        }

        .publisher-inner p {
          max-width: 620px;
          margin: 0;
          color: #c9dbd1;
          line-height: 1.7;
        }

        .publisher-inner > a {
          flex-shrink: 0;
          padding: 13px 18px;
          border: 1px solid #c59d5f;
          border-radius: 8px;
          color: #f7e7bd;
          text-decoration: none;
          font-weight: 800;
        }

        .footer {
          padding: 55px 0 20px;
          background: #031f10;
          color: #cbd5cf;
        }

        .footer-grid {
          display: grid;
          grid-template-columns:
            2fr 1fr 1fr 1fr;
          gap: 45px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer-brand > div {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 1px solid #c59d5f;
          border-radius: 10px;
          color: #d7b76d;
          font:
            bold 22px
            Georgia,
            serif;
        }

        .footer-brand strong {
          color: white;
        }

        .footer-brand small {
          display: block;
          margin-top: 3px;
          color: #c59d5f;
          font-size: 9px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .footer-grid p {
          max-width: 350px;
          color: #9db2a6;
          line-height: 1.7;
          font-size: 12px;
        }

        .footer-grid h3 {
          margin: 0 0 15px;
          color: white;
          font-size: 13px;
        }

        .footer-grid a,
        .footer-grid span {
          display: block;
          margin: 8px 0;
          color: #9db2a6;
          font-size: 12px;
          text-decoration: none;
        }

        .footer-grid a:hover {
          color: #d7b76d;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid
            rgba(255, 255, 255, 0.1);
          color: #71877b;
          font-size: 10px;
        }

        @media (max-width: 1000px) {
          .featured-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .book-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .value-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .footer-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (max-width: 760px) {
          .header-inner {
            flex-wrap: wrap;
          }

          .main-nav {
            display: none;
            order: 3;
            flex-basis: 100%;
            flex-direction: column;
            padding-bottom: 15px;
          }

          .main-nav.mobile-open {
            display: flex;
          }

          .menu-button {
            display: block;
          }

          .login-link,
          .header-actions > select {
            display: none;
          }

          .hero-content {
            padding: 70px 20px;
          }

          .hero h1 {
            font-size: 43px;
          }

          .hero-search {
            flex-wrap: wrap;
          }

          .hero-search input {
            width: 100%;
          }

          .hero-search button {
            width: 100%;
          }

          .section-heading,
          .category-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .collection-layout {
            grid-template-columns: 1fr;
          }

          .filter-panel {
            position: static;
          }

          .publisher-inner {
            flex-direction: column;
            align-items: flex-start;
          }

          .footer-bottom {
            flex-direction: column;
          }
        }

        @media (max-width: 560px) {
          .featured-grid,
          .book-grid,
          .value-grid,
          .footer-grid {
            grid-template-columns: 1fr;
          }

          .container {
            padding-left: 16px;
            padding-right: 16px;
          }

          .hero h1 {
            font-size: 36px;
          }

          .section-heading h2 {
            font-size: 34px;
          }
        }
      `}</style>
    </main>
  );
}

function Value({
  icon,
  title,
  text,
}) {
  return (
    <div className="value">
      <div className="value-icon">
        {icon}
      </div>

      <div>
        <strong>{title}</strong>

        <p>{text}</p>
      </div>
    </div>
  );
}

