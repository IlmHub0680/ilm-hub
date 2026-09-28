export const categories = [
  'All',
  'Qur’an & Tafsir',
  'Hadith',
  'Fiqh',
  'Aqidah',
  'Seerah',
  'Arabic',
  'History',
  'General',
];

export const currencies = {
  USD: {
    code: 'USD',
    symbol: '$',
    rate: 1,
  },

  GHS: {
    code: 'GHS',
    symbol: 'GH₵',
    rate: 15,
  },
};

export function formatPrice(
  price,
  currency = 'USD'
) {
  const config =
    currencies[currency] || currencies.USD;

  const converted =
    Number(price || 0) * config.rate;

  return new Intl.NumberFormat(
    currency === 'GHS' ? 'en-GH' : 'en-US',
    {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 2,
    }
  ).format(converted);
}
