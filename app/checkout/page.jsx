'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

const CURRENCY_KEY =
  'ilmhub-currency';

const CART_KEY =
  'ilmhub-cart';

const CURRENCY_INFO = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
  },

  GHS: {
    code: 'GHS',
    symbol: 'GH₵',
    name: 'Ghanaian Cedi',
  },
};

function formatPrice(
  amount,
  currency
) {
  const info =
    CURRENCY_INFO[currency] ||
    CURRENCY_INFO.USD;

  return `${info.symbol}${Number(
    amount
  ).toFixed(2)}`;
}

function convertPrice(
  usdPrice,
  currency,
  exchangeRate
) {
  const amount =
    Number(usdPrice) || 0;

  if (
    currency === 'GHS'
  ) {
    if (
      !Number.isFinite(
        exchangeRate
      ) ||
      exchangeRate <= 0
    ) {
      return 0;
    }

    return (
      amount *
      exchangeRate
    );
  }

  return amount;
}

export default function CheckoutPage() {
  const router =
    useRouter();


  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(true);

  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);

  const [
    userEmail,
    setUserEmail,
  ] = useState('');

  const [
    cartItems,
    setCartItems,
  ] = useState([]);

  const [
    currency,
    setCurrency,
  ] = useState('USD');

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState('stripe');

  const [
    exchangeRate,
    setExchangeRate,
  ] = useState(null);

  const [
    loadingExchangeRate,
    setLoadingExchangeRate,
  ] = useState(true);

  const [
    ready,
    setReady,
  ] = useState(false);

  /*
   * ==========================================================
   * AUTHENTICATION
   * ==========================================================
   */

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      try {
        const response = await fetch(
          '/api/auth/me',
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          }
        );

        const data =
          await response.json();

        if (!mounted) {
          return;
        }

        if (
          !response.ok ||
          !data?.success ||
          !data?.user
        ) {
          setAuthenticated(false);

          router.replace(
            '/account?next=/checkout'
          );

          return;
        }

        setAuthenticated(true);

        setUserEmail(
          data.user.email || ''
        );
      } catch (error) {
        console.error(
          'Checkout auth check failed:',
          error
        );

        if (mounted) {
          setAuthenticated(false);

          router.replace(
            '/account?next=/checkout'
          );
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    }

    checkUser();

    return () => {
      mounted = false;
    };
  }, [router]);


  /*
   * ==========================================================
   * LOAD CART
   * ==========================================================
   */

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem(
          CART_KEY
        );

      const savedCurrency =
        localStorage.getItem(
          CURRENCY_KEY
        );

      if (savedCart) {
        const parsedCart =
          JSON.parse(
            savedCart
          );

        if (
          Array.isArray(
            parsedCart
          )
        ) {
          setCartItems(
            parsedCart
          );
        }
      }

      if (
        savedCurrency &&
        CURRENCY_INFO[
          savedCurrency
        ]
      ) {
        setCurrency(
          savedCurrency
        );
      }
    } catch (error) {
      console.error(
        'Unable to load checkout data:',
        error
      );
    } finally {
      setReady(true);
    }
  }, []);

  /*
   * ==========================================================
   * LOAD SERVER EXCHANGE RATE
   * ==========================================================
   *
   * The client does NOT contain an exchange rate.
   *
   * The server provides it.
   * ==========================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadCheckoutConfig() {
      try {
        setLoadingExchangeRate(
          true
        );

        const response =
          await fetch(
            '/api/checkout',
            {
              method: 'GET',
              cache: 'no-store',
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data?.success
        ) {
          throw new Error(
            data?.error ||
              'Unable to load payment configuration.'
          );
        }

        const rate =
          Number(
            data?.paymentMethods
              ?.paystack
              ?.usdToGhsRate
          );

        if (
          !Number.isFinite(
            rate
          ) ||
          rate <= 0
        ) {
          throw new Error(
            'The server returned an invalid Paystack exchange rate.'
          );
        }

        if (mounted) {
          setExchangeRate(
            rate
          );
        }
      } catch (error) {
        console.error(
          'Unable to load checkout configuration:',
          error
        );

        if (mounted) {
          setExchangeRate(
            null
          );
        }
      } finally {
        if (mounted) {
          setLoadingExchangeRate(
            false
          );
        }
      }
    }

    loadCheckoutConfig();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ==========================================================
   * SAVE CURRENCY
   * ==========================================================
   */

  useEffect(() => {
    if (!ready) {
      return;
    }

    try {
      localStorage.setItem(
        CURRENCY_KEY,
        currency
      );
    } catch (error) {
      console.error(
        'Unable to save currency:',
        error
      );
    }
  }, [
    currency,
    ready,
  ]);

  /*
   * ==========================================================
   * PAYMENT METHOD
   * ==========================================================
   */

  function handlePaymentMethodChange(
    method
  ) {
    if (
      method === 'stripe'
    ) {
      setPaymentMethod(
        'stripe'
      );

      setCurrency(
        'USD'
      );

      return;
    }

    if (
      method ===
      'paystack'
    ) {
      setPaymentMethod(
        'paystack'
      );

      setCurrency(
        'GHS'
      );
    }
  }

  /*
   * ==========================================================
   * CURRENCY CHANGE
   * ==========================================================
   */

  function handleCurrencyChange(
    nextCurrency
  ) {
    if (
      nextCurrency ===
      'USD'
    ) {
      setCurrency('USD');
      setPaymentMethod(
        'stripe'
      );

      return;
    }

    if (
      nextCurrency ===
      'GHS'
    ) {
      setCurrency('GHS');

      if (
        paymentMethod ===
        'stripe'
      ) {
        setPaymentMethod(
          'paystack'
        );
      }
    }
  }

  /*
   * ==========================================================
   * TOTAL
   * ==========================================================
   */

  const usdTotal =
    useMemo(() => {
      return cartItems.reduce(
        (
          sum,
          item
        ) => {
          const price =
            Number(
              item?.price
            ) || 0;

          const quantity =
            Math.max(
              1,
              Number(
                item?.quantity
              ) || 1
            );

          return (
            sum +
            price *
              quantity
          );
        },
        0
      );
    }, [
      cartItems,
    ]);

  const convertedTotal =
    useMemo(() => {
      return convertPrice(
        usdTotal,
        currency,
        exchangeRate
      );
    }, [
      usdTotal,
      currency,
      exchangeRate,
    ]);

  /*
   * ==========================================================
   * START PAYMENT
   * ==========================================================
   */

  async function handlePayment() {
    if (!authenticated) {
      router.push(
        '/account?next=/checkout'
      );

      return;
    }

    if (
      cartItems.length === 0
    ) {
      alert(
        'Your cart is empty. Please return to the bookstore.'
      );

      return;
    }

    if (
      paymentMethod ===
        'paystack' &&
      !exchangeRate
    ) {
      alert(
        'Payment configuration is still loading. Please try again.'
      );

      return;
    }

    try {
      setLoading(true);

      /*
       * ------------------------------------------------------
       * GET LATEST SESSION
       * ------------------------------------------------------
       */

      const meResponse =
  await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

const meData =
  await meResponse.json();

if (
  !meResponse.ok ||
  !meData?.success ||
  !meData?.user
) {
  router.push(
    '/account?next=/checkout'
  );

  return;
}


      /*
       * ------------------------------------------------------
       * CART
       * ------------------------------------------------------
       */

      const items =
        cartItems
          .map((item) => ({
            id: item?.id,

            quantity:
              Math.max(
                1,
                Math.floor(
                  Number(
                    item?.quantity
                  ) || 1
                )
              ),
          }))
          .filter(
            (item) =>
              item.id
          );

      if (
        items.length === 0
      ) {
        throw new Error(
          'Your cart contains no valid books.'
        );
      }

      /*
       * ------------------------------------------------------
       * SERVER EXPECTS ONLY:
       *
       * stripe
       * paystack
       * ------------------------------------------------------
       */

      const response =
        await fetch(
          '/api/checkout',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                items,

                paymentMethod:
                  paymentMethod,

                currency:
                  currency,
              }),
          }
        );

      const responseText =
        await response.text();

      let data = {};

      if (responseText) {
        try {
          data =
            JSON.parse(
              responseText
            );
        } catch {
          throw new Error(
            `Checkout server returned an invalid response (${response.status}).`
          );
        }
      }

      if (
        response.status ===
        401
      ) {
        router.push(
          '/account?next=/checkout'
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Unable to start checkout (${response.status}).`
        );
      }

      /*
       * ------------------------------------------------------
       * REDIRECT
       * ------------------------------------------------------
       */

      if (data?.url) {
        window.location.href =
          data.url;

        return;
      }

      throw new Error(
        'Payment checkout URL was not returned by the server.'
      );
    } catch (error) {
      console.error(
        'Payment error:',
        error
      );

      alert(
        error?.message ||
          'Unable to start payment.'
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (checkingAuth) {
    return (
      <div
        style={loadingPage}
      >
        <div
          style={loadingCard}
        >
          <div
            style={loadingLogo}
          >
            ع
          </div>

          <h2>
            Checking your account...
          </h2>

          <p>
            Please wait while we
            securely verify your
            account.
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div
        style={loadingPage}
      >
        <div
          style={loadingCard}
        >
          <div
            style={loadingLogo}
          >
            ع
          </div>

          <h2>
            Redirecting to sign in...
          </h2>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div
        style={loadingPage}
      >
        <div
          style={loadingCard}
        >
          <div
            style={loadingLogo}
          >
            ع
          </div>

          <h2>
            Loading checkout...
          </h2>
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * PAGE
   * ==========================================================
   */

  return (
    <main style={page}>
      <div style={container}>
        <div style={topBar}>
          <button
            type="button"
            onClick={() =>
              router.push(
                '/bookstore'
              )
            }
            style={backButton}
          >
            ← Back to Bookstore
          </button>

          <div style={secure}>
            🔒 Secure Checkout
          </div>
        </div>

        <div style={header}>
          <div>
            <div style={eyebrow}>
              ILM-HUB BOOKSTORE
            </div>

            <h1 style={heading}>
              Complete Your Order
            </h1>

            <p style={subtitle}>
              Review your books and
              choose your preferred
              payment method.
            </p>
          </div>
        </div>

        <div style={accountBox}>
          <div style={accountIcon}>
            ✓
          </div>

          <div>
            <strong
              style={{
                color: '#14532d',
              }}
            >
              Signed in
            </strong>

            <div
              style={{
                color: '#64748b',
                marginTop: '3px',
                fontSize: '14px',
              }}
            >
              {userEmail}
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div style={empty}>
            <div
              style={{
                fontSize: '55px',
              }}
            >
              📚
            </div>

            <h2
              style={{
                color: '#14532d',
              }}
            >
              Your cart is empty
            </h2>

            <p style={subtitle}>
              Add a book to your cart
              before checking out.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  '/bookstore'
                )
              }
              style={primaryButton}
            >
              Browse Bookstore
            </button>
          </div>
        ) : (
          <div style={layout}>
            {/* ORDER SUMMARY */}

            <section
              style={summaryCard}
            >
              <div style={cardHeader}>
                <div>
                  <span style={eyebrow}>
                    YOUR ORDER
                  </span>

                  <h2
                    style={cardTitle}
                  >
                    Order Summary
                  </h2>
                </div>

                <div
                  style={itemCount}
                >
                  {cartItems.length}{' '}
                  {cartItems.length ===
                  1
                    ? 'book'
                    : 'books'}
                </div>
              </div>

              <div>
                {cartItems.map(
                  (
                    item,
                    index
                  ) => {
                    const quantity =
                      Math.max(
                        1,
                        Number(
                          item?.quantity
                        ) || 1
                      );

                    const itemUsd =
                      (Number(
                        item?.price
                      ) || 0) *
                      quantity;

                    const itemConverted =
                      convertPrice(
                        itemUsd,
                        currency,
                        exchangeRate
                      );

                    return (
                      <div
                        key={
                          item?.id ||
                          index
                        }
                        style={
                          orderItem
                        }
                      >
                        <div
                          style={
                            itemNumber
                          }
                        >
                          {index + 1}
                        </div>

                        <div
                          style={
                            itemInfo
                          }
                        >
                          <strong
                            style={{
                              color:
                                '#1e293b',
                              lineHeight:
                                1.4,
                            }}
                          >
                            {item?.title ||
                              'Book'}
                          </strong>

                          <span
                            style={{
                              color:
                                '#64748b',
                              fontSize:
                                '13px',
                              marginTop:
                                '4px',
                            }}
                          >
                            Quantity:{' '}
                            {quantity}
                          </span>
                        </div>

                        <strong
                          style={{
                            color:
                              '#14532d',
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {formatPrice(
                            itemConverted,
                            currency
                          )}
                        </strong>
                      </div>
                    );
                  }
                )}
              </div>

              <div
                style={totalBox}
              >
                <span
                  style={{
                    fontWeight:
                      '700',
                  }}
                >
                  Total
                </span>

                <strong
                  style={totalPrice}
                >
                  {currency ===
                    'GHS' &&
                  loadingExchangeRate
                    ? 'Loading...'
                    : formatPrice(
                        convertedTotal,
                        currency
                      )}
                </strong>
              </div>

              {currency ===
                'GHS' && (
                <div
                  style={reference}
                >
                  {exchangeRate
                    ? `Rate: 1 USD = ${exchangeRate.toFixed(
                        4
                      )} GHS`
                    : 'Exchange rate unavailable'}
                  <br />
                  Approximate USD value:{' '}
                  {formatPrice(
                    usdTotal,
                    'USD'
                  )}
                </div>
              )}
            </section>

            {/* PAYMENT */}

            <section
              style={paymentCard}
            >
              <span style={eyebrow}>
                PAYMENT
              </span>

              <h2
                style={cardTitle}
              >
                Choose Payment Method
              </h2>

              <div
                style={
                  paymentOptions
                }
              >
                {/* STRIPE */}

                <button
                  type="button"
                  onClick={() =>
                    handlePaymentMethodChange(
                      'stripe'
                    )
                  }
                  style={{
                    ...paymentOption,

                    ...(paymentMethod ===
                    'stripe'
                      ? selectedPayment
                      : {}),
                  }}
                >
                  <div
                    style={
                      paymentIcon
                    }
                  >
                    💳
                  </div>

                  <div
                    style={
                      paymentText
                    }
                  >
                    <strong>
                      Stripe
                    </strong>

                    <span>
                      Pay securely
                      with card
                    </span>
                  </div>

                  <div
                    style={radio(
                      paymentMethod ===
                        'stripe'
                    )}
                  >
                    {paymentMethod ===
                      'stripe' &&
                      '✓'}
                  </div>
                </button>

                {/* PAYSTACK */}

                <button
                  type="button"
                  onClick={() =>
                    handlePaymentMethodChange(
                      'paystack'
                    )
                  }
                  style={{
                    ...paymentOption,

                    ...(paymentMethod ===
                    'paystack'
                      ? selectedPayment
                      : {}),
                  }}
                >
                  <div
                    style={
                      paymentIcon
                    }
                  >
                    💰
                  </div>

                  <div
                    style={
                      paymentText
                    }
                  >
                    <strong>
                      Paystack
                    </strong>

                    <span>
                      Card, Mobile
                      Money & more
                    </span>
                  </div>

                  <div
                    style={radio(
                      paymentMethod ===
                        'paystack'
                    )}
                  >
                    {paymentMethod ===
                      'paystack' &&
                      '✓'}
                  </div>
                </button>
              </div>

              {/* CURRENCY */}

              <div
                style={currencyBox}
              >
                <label
                  htmlFor="currency"
                  style={
                    currencyLabel
                  }
                >
                  Payment Currency
                </label>

                <select
                  id="currency"
                  value={currency}
                  onChange={(e) =>
                    handleCurrencyChange(
                      e.target.value
                    )
                  }
                  style={
                    currencySelect
                  }
                >
                  <option value="USD">
                    USD — US Dollar
                  </option>

                  <option value="GHS">
                    GHS — Ghanaian Cedi
                  </option>
                </select>

                <p
                  style={
                    currencyHelp
                  }
                >
                  {currency ===
                  'USD'
                    ? 'Stripe payments are processed in USD.'
                    : 'Paystack payments are processed in GHS and can offer available payment channels such as Mobile Money.'}
                </p>

                {currency ===
                  'GHS' && (
                  <p
                    style={{
                      margin:
                        '8px 0 0',
                      color:
                        '#166534',
                      fontSize:
                        '11px',
                      fontWeight:
                        '700',
                    }}
                  >
                    {exchangeRate
                      ? `Server exchange rate: 1 USD = ${exchangeRate.toFixed(
                          4
                        )} GHS`
                      : loadingExchangeRate
                      ? 'Loading server exchange rate...'
                      : 'Server exchange rate unavailable.'}
                  </p>
                )}
              </div>

              {/* PAYMENT INFO */}

              <div
                style={
                  securityBox
                }
              >
                <div
                  style={{
                    fontSize:
                      '22px',
                  }}
                >
                  🔐
                </div>

                <div>
                  <strong>
                    Secure Payment
                  </strong>

                  <p
                    style={{
                      margin:
                        '3px 0 0',
                      fontSize:
                        '12px',
                      lineHeight:
                        1.5,
                    }}
                  >
                    Your payment is
                    processed securely
                    by the selected
                    payment provider.
                    Ilm-Hub does not
                    store your card
                    details.
                  </p>
                </div>
              </div>

              {/* PAY */}

              <button
                type="button"
                onClick={
                  handlePayment
                }
                disabled={
                  loading ||
                  (paymentMethod ===
                    'paystack' &&
                    !exchangeRate)
                }
                style={{
                  ...payButton,

                  opacity:
                    loading ||
                    (paymentMethod ===
                      'paystack' &&
                      !exchangeRate)
                      ? 0.65
                      : 1,

                  cursor:
                    loading ||
                    (paymentMethod ===
                      'paystack' &&
                      !exchangeRate)
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {loading
                  ? 'Connecting to Payment...'
                  : paymentMethod ===
                    'stripe'
                  ? 'Pay with Stripe →'
                  : 'Pay with Paystack →'}
              </button>

              <p
                style={
                  paymentNote
                }
              >
                After payment, your order
                will be reviewed by the
                Ilm-Hub administrator.
                Your book becomes
                downloadable after approval.
              </p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const page = {
  minHeight: '100vh',
  background:
    'linear-gradient(135deg,#f8fafc,#f0fdf4)',
  padding:
    '35px 20px 60px',
  fontFamily:
    'Inter, sans-serif',
};

const container = {
  maxWidth:
    '1100px',
  margin:
    '0 auto',
};

const topBar = {
  display: 'flex',
  justifyContent:
    'space-between',
  alignItems:
    'center',
  gap: '15px',
  flexWrap:
    'wrap',
  marginBottom:
    '35px',
};

const backButton = {
  border: 'none',
  background:
    'transparent',
  color: '#14532d',
  fontWeight: '800',
  cursor: 'pointer',
  padding: '0',
  fontSize: '14px',
};

const secure = {
  color: '#166534',
  background: '#dcfce7',
  border:
    '1px solid #bbf7d0',
  borderRadius:
    '30px',
  padding:
    '8px 14px',
  fontSize: '12px',
  fontWeight: '800',
};

const header = {
  marginBottom:
    '25px',
};

const eyebrow = {
  display: 'block',
  color: '#a16207',
  fontSize: '11px',
  fontWeight: '900',
  letterSpacing:
    '1.7px',
  marginBottom:
    '7px',
};

const heading = {
  color: '#14532d',
  fontFamily:
    'Georgia, serif',
  fontSize: '40px',
  margin:
    '0 0 8px',
};

const subtitle = {
  color: '#64748b',
  lineHeight: 1.6,
  margin: '0',
};

const accountBox = {
  display: 'flex',
  alignItems:
    'center',
  gap: '12px',
  background:
    '#ffffff',
  border:
    '1px solid #d1fae5',
  borderRadius:
    '12px',
  padding:
    '14px 17px',
  marginBottom:
    '25px',
};

const accountIcon = {
  width: '32px',
  height: '32px',
  borderRadius:
    '50%',
  background:
    '#dcfce7',
  color: '#166534',
  display: 'flex',
  alignItems:
    'center',
  justifyContent:
    'center',
  fontWeight: '900',
};

const layout = {
  display: 'grid',
  gridTemplateColumns:
    'minmax(0,1.05fr) minmax(320px,.95fr)',
  gap: '25px',
  alignItems:
    'start',
};

const summaryCard = {
  background:
    '#ffffff',
  border:
    '1px solid #e2e8f0',
  borderRadius:
    '18px',
  padding: '25px',
  boxShadow:
    '0 10px 30px rgba(15,23,42,.05)',
};

const paymentCard = {
  background:
    '#ffffff',
  border:
    '1px solid #e2e8f0',
  borderRadius:
    '18px',
  padding: '25px',
  boxShadow:
    '0 10px 30px rgba(15,23,42,.05)',
};

const cardHeader = {
  display: 'flex',
  justifyContent:
    'space-between',
  alignItems:
    'start',
  gap: '15px',
};

const cardTitle = {
  color: '#14532d',
  fontFamily:
    'Georgia, serif',
  fontSize: '24px',
  margin:
    '5px 0 20px',
};

const itemCount = {
  background:
    '#f0fdf4',
  color: '#166534',
  borderRadius:
    '20px',
  padding:
    '6px 10px',
  fontSize: '12px',
  fontWeight: '800',
};

const orderItem = {
  display: 'flex',
  alignItems:
    'center',
  gap: '12px',
  padding:
    '16px 0',
  borderBottom:
    '1px solid #e2e8f0',
};

const itemNumber = {
  width: '30px',
  height: '30px',
  minWidth: '30px',
  borderRadius:
    '8px',
  background:
    '#14532d',
  color: '#ffffff',
  display: 'flex',
  alignItems:
    'center',
  justifyContent:
    'center',
  fontWeight: '900',
  fontSize: '12px',
};

const itemInfo = {
  display: 'flex',
  flexDirection:
    'column',
  flex: 1,
};

const totalBox = {
  display: 'flex',
  justifyContent:
    'space-between',
  alignItems:
    'center',
  marginTop:
    '20px',
  paddingTop:
    '20px',
  borderTop:
    '2px solid #14532d',
  fontSize: '18px',
};

const totalPrice = {
  color: '#16a34a',
  fontSize: '25px',
};

const reference = {
  textAlign: 'right',
  marginTop: '8px',
  color: '#64748b',
  fontSize: '11px',
  lineHeight: 1.6,
};

const paymentOptions = {
  display: 'flex',
  flexDirection:
    'column',
  gap: '10px',
};

const paymentOption = {
  width: '100%',
  display: 'flex',
  alignItems:
    'center',
  gap: '12px',
  padding: '14px',
  borderRadius:
    '12px',
  border:
    '1px solid #e2e8f0',
  background:
    '#ffffff',
  cursor:
    'pointer',
  textAlign:
    'left',
};

const selectedPayment = {
  border:
    '2px solid #16a34a',
  background:
    '#f0fdf4',
};

const paymentIcon = {
  width: '42px',
  height: '42px',
  minWidth: '42px',
  borderRadius:
    '10px',
  background:
    '#f8fafc',
  display: 'flex',
  alignItems:
    'center',
  justifyContent:
    'center',
  fontSize: '21px',
};

const paymentText = {
  display: 'flex',
  flexDirection:
    'column',
  gap: '3px',
  flex: 1,
};

const radio = (
  selected
) => ({
  width: '22px',
  height: '22px',
  borderRadius:
    '50%',
  border:
    selected
      ? '2px solid #16a34a'
      : '2px solid #cbd5e1',
  background:
    selected
      ? '#16a34a'
      : '#ffffff',
  color: '#ffffff',
  display: 'flex',
  alignItems:
    'center',
  justifyContent:
    'center',
  fontSize: '12px',
  fontWeight: '900',
});

const currencyBox = {
  marginTop:
    '20px',
  padding: '15px',
  background:
    '#f8fafc',
  border:
    '1px solid #e2e8f0',
  borderRadius:
    '11px',
};

const currencyLabel = {
  display: 'block',
  color: '#334155',
  fontWeight: '800',
  fontSize: '13px',
  marginBottom:
    '7px',
};

const currencySelect = {
  width: '100%',
  padding: '11px',
  border:
    '1px solid #cbd5e1',
  borderRadius:
    '8px',
  background:
    '#ffffff',
  color: '#14532d',
  fontWeight: '700',
  fontSize: '14px',
};

const currencyHelp = {
  margin:
    '8px 0 0',
  color: '#64748b',
  fontSize: '11px',
  lineHeight: 1.5,
};

const securityBox = {
  display: 'flex',
  gap: '10px',
  marginTop:
    '18px',
  padding: '13px',
  background:
    '#f0fdf4',
  border:
    '1px solid #bbf7d0',
  borderRadius:
    '10px',
  color: '#166534',
  fontSize: '13px',
};

const payButton = {
  width: '100%',
  marginTop:
    '18px',
  padding: '15px',
  border: 'none',
  borderRadius:
    '10px',
  background:
    '#14532d',
  color: '#ffffff',
  fontWeight: '900',
  fontSize: '16px',
};

const paymentNote = {
  textAlign:
    'center',
  color: '#64748b',
  fontSize: '11px',
  lineHeight: 1.6,
  margin:
    '12px 0 0',
};

const primaryButton = {
  border: 'none',
  background:
    '#14532d',
  color: '#ffffff',
  padding:
    '13px 22px',
  borderRadius:
    '8px',
  fontWeight: '800',
  cursor:
    'pointer',
};

const empty = {
  background:
    '#ffffff',
  border:
    '1px solid #e2e8f0',
  borderRadius:
    '18px',
  padding:
    '60px 20px',
  textAlign:
    'center',
};

const loadingPage = {
  minHeight: '100vh',
  background:
    'linear-gradient(135deg,#052e16,#14532d)',
  display: 'flex',
  alignItems:
    'center',
  justifyContent:
    'center',
  padding: '20px',
  fontFamily:
    'Inter, sans-serif',
};

const loadingCard = {
  width: '100%',
  maxWidth: '420px',
  background:
    '#ffffff',
  borderRadius:
    '18px',
  padding: '40px',
  textAlign:
    'center',
  boxShadow:
    '0 30px 70px rgba(0,0,0,.25)',
};

const loadingLogo = {
  width: '55px',
  height: '55px',
  borderRadius:
    '14px',
  background:
    '#14532d',
  color: '#c59d5f',
  display: 'flex',
  alignItems:
    'center',
  justifyContent:
    'center',
  fontSize: '28px',
  fontWeight: '900',
  margin:
    '0 auto 20px',
};
