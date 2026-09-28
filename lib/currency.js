export const CURRENCIES = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    rate: 1,
    decimals: 2,
  },

  GHS: {
    code: "GHS",
    symbol: "GH₵",
    name: "Ghanaian Cedi",
    rate: 12.5,
    decimals: 2,
  },
};

export function isSupportedCurrency(currency) {
  return Object.prototype.hasOwnProperty.call(
    CURRENCIES,
    currency
  );
}

export function getCurrency(currency) {
  if (!isSupportedCurrency(currency)) {
    throw new Error(
      `Unsupported currency: ${currency}`
    );
  }

  return CURRENCIES[currency];
}

export function convertUsdToCurrency(
  usdAmount,
  currency
) {
  const selected = getCurrency(currency);

  return Number(
    (Number(usdAmount) * selected.rate).toFixed(
      selected.decimals
    )
  );
}
