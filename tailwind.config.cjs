/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // These bind straight to the Ulul Azm design tokens in app/globals.css
      // (single source of truth) rather than duplicating hex values, so a
      // handful of pages (analytics, newsletter, author-approvals,
      // sponsor-manager, publishing, publishing/faq, publishing/request-quote)
      // that were already written with Tailwind utility classes render in the
      // institute's real deep-green/gold identity instead of Tailwind's
      // generic "emerald" green — without touching any of that markup.
      colors: {
        emerald: {
          50: 'var(--brand-tint)',
          100: 'var(--brand-tint-2)',
          200: '#c3d9c9',
          300: '#9dc1a8',
          400: '#6da283',
          500: '#3d8163',
          600: 'var(--brand)',
          700: 'var(--brand-dark)',
          800: '#092d19',
          900: 'var(--brand-deepest)',
        },
        slate: {
          900: 'var(--ink)',
          800: 'var(--ink)',
          700: 'var(--ink)',
          600: 'var(--ink-soft)',
          500: 'var(--ink-soft)',
        },
        gray: {
          900: 'var(--ink)',
          700: 'var(--ink-soft)',
          600: 'var(--ink-soft)',
          500: 'var(--ink-soft)',
        },
        brand: {
          DEFAULT: 'var(--brand)',
          dark: 'var(--brand-dark)',
          deepest: 'var(--brand-deepest)',
          light: 'var(--brand-light)',
          tint: 'var(--brand-tint)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          dark: 'var(--gold-dark)',
          tint: 'var(--gold-tint)',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['var(--font-display)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
