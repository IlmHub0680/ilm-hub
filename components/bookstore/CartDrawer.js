'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

export default function CartDrawer({
  open,
  cart,
  currency,
  formatPrice,
  onClose,
  onRemove,
  onChangeQuantity,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Lock the bookstore page while the cart is open.
   */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /*
   * Close the drawer with Escape.
   */
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!mounted || !open) {
    return null;
  }

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const count = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const drawer = (
    <>
      <div
        className="ilm-cart-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="ilm-cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        {/* HEADER */}
        <header className="ilm-cart-header">
          <div>
            <span className="ilm-cart-label">
              YOUR ORDER
            </span>

            <h2>Shopping Cart</h2>

            <p>
              {count}{' '}
              {count === 1 ? 'item' : 'items'}
            </p>
          </div>

          <button
            type="button"
            className="ilm-cart-close"
            onClick={onClose}
            aria-label="Close shopping cart"
          >
            ×
          </button>
        </header>

        {/* EMPTY CART */}
        {cart.length === 0 ? (
          <div className="ilm-cart-empty">
            <div className="ilm-cart-empty-icon">
              🛒
            </div>

            <h3>Your cart is empty</h3>

            <p>
              Add books from our collection
              to begin your order.
            </p>

            <button
              type="button"
              className="ilm-cart-continue"
              onClick={onClose}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* ITEMS */}
            <div className="ilm-cart-items">
              {cart.map((item) => (
                <article
                  className="ilm-cart-item"
                  key={item.id}
                >
                  <div className="ilm-cart-cover">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                      />
                    ) : (
                      <div className="ilm-cart-cover-placeholder">
                        BOOK
                      </div>
                    )}
                  </div>

                  <div className="ilm-cart-info">
                    <h3>{item.title}</h3>

                    {item.author && (
                      <p className="ilm-cart-author">
                        {item.author}
                      </p>
                    )}

                    <strong className="ilm-cart-price">
                      {formatPrice(
                        item.price,
                        currency
                      )}
                    </strong>

                    <div className="ilm-cart-controls">
                      <div className="ilm-quantity">
                        <button
                          type="button"
                          onClick={() =>
                            onChangeQuantity(
                              item.id,
                              -1
                            )
                          }
                          aria-label={`Decrease quantity of ${item.title}`}
                        >
                          −
                        </button>

                        <span>
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            onChangeQuantity(
                              item.id,
                              1
                            )
                          }
                          aria-label={`Increase quantity of ${item.title}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="ilm-remove"
                        onClick={() =>
                          onRemove(item.id)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* SUMMARY */}
            <div className="ilm-cart-summary">
              <div className="ilm-summary-row">
                <span>Subtotal</span>

                <strong>
                  {formatPrice(
                    total,
                    currency
                  )}
                </strong>
              </div>

              <p className="ilm-summary-note">
                Delivery and applicable charges
                are calculated at checkout.
              </p>

              <Link
                href="/checkout"
                className="ilm-checkout-button"
                onClick={onClose}
              >
                <span>
                  Proceed to Secure Checkout
                </span>

                <span aria-hidden="true">
                  →
                </span>
              </Link>

              <button
                type="button"
                className="ilm-shopping-button"
                onClick={onClose}
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>

      <style jsx global>{`
        /*
         * =====================================================
         * ILM-HUB CART DRAWER
         * =====================================================
         */

        .ilm-cart-overlay {
          position: fixed !important;
          inset: 0 !important;

          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;

          z-index: 2147483646 !important;

          background: rgba(
            7,
            18,
            35,
            0.58
          ) !important;

          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
        }

        .ilm-cart-drawer {
          position: fixed !important;

          top: 0 !important;
          right: 0 !important;
          bottom: 0 !important;

          width: min(
            460px,
            94vw
          ) !important;

          height: 100vh !important;
          height: 100dvh !important;

          z-index: 2147483647 !important;

          display: flex !important;
          flex-direction: column !important;

          margin: 0 !important;
          padding: 0 !important;

          background: #ffffff !important;
          color: #10213a !important;

          box-shadow:
            -20px 0 60px
              rgba(7, 18, 35, 0.25) !important;

          overflow: hidden !important;

          isolation: isolate;
        }

        /*
         * HEADER
         */

        .ilm-cart-header {
          flex: 0 0 auto;

          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          padding: 28px 28px 22px;

          background:
            linear-gradient(
              135deg,
              #ffffff 0%,
              #fbfcfe 100%
            );

          border-bottom: 1px solid
            #e7ebf0;
        }

        .ilm-cart-label {
          display: block;

          margin-bottom: 7px;

          color: #b28735;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.18em;

          text-transform: uppercase;
        }

        .ilm-cart-header h2 {
          margin: 0;

          color: #0d1b32;

          font-family:
            Georgia,
            'Times New Roman',
            serif;

          font-size: 27px;
          font-weight: 700;

          line-height: 1.15;
        }

        .ilm-cart-header p {
          margin: 7px 0 0;

          color: #738198;

          font-size: 13px;
        }

        .ilm-cart-close {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border: 1px solid
            #dce3eb;

          border-radius: 50%;

          background: #ffffff;
          color: #10213a;

          font-size: 27px;
          font-weight: 300;

          line-height: 1;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .ilm-cart-close:hover {
          background: #f2f6fa;

          border-color: #b28735;

          transform: rotate(5deg);
        }

        /*
         * ITEMS
         */

        .ilm-cart-items {
          flex: 1 1 auto;

          min-height: 0;

          overflow-y: auto;
          overflow-x: hidden;

          padding: 8px 26px 20px;

          overscroll-behavior: contain;

          -webkit-overflow-scrolling: touch;

          scrollbar-width: thin;
          scrollbar-color:
            #c8d0da
            transparent;
        }

        .ilm-cart-items::-webkit-scrollbar {
          width: 6px;
        }

        .ilm-cart-items::-webkit-scrollbar-track {
          background: transparent;
        }

        .ilm-cart-items::-webkit-scrollbar-thumb {
          background: #c8d0da;
          border-radius: 20px;
        }

        .ilm-cart-item {
          display: flex;

          gap: 15px;

          padding: 18px 0;

          border-bottom: 1px solid
            #edf0f3;
        }

        .ilm-cart-cover {
          flex: 0 0 68px;

          width: 68px;
          height: 88px;

          overflow: hidden;

          border-radius: 6px;

          background:
            linear-gradient(
              145deg,
              #eef2f5,
              #dfe5eb
            );

          box-shadow:
            0 3px 10px
              rgba(7, 18, 35, 0.1);
        }

        .ilm-cart-cover img {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;
        }

        .ilm-cart-cover-placeholder {
          width: 100%;
          height: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #637086;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 0.1em;
        }

        .ilm-cart-info {
          min-width: 0;
          flex: 1;
        }

        .ilm-cart-info h3 {
          margin: 1px 0 0;

          color: #152640;

          font-family:
            Georgia,
            'Times New Roman',
            serif;

          font-size: 15px;
          font-weight: 700;

          line-height: 1.35;
        }

        .ilm-cart-author {
          margin: 4px 0 0;

          color: #7a8799;

          font-size: 11px;

          line-height: 1.4;
        }

        .ilm-cart-price {
          display: block;

          margin-top: 7px;

          color: #b28735;

          font-size: 14px;
          font-weight: 800;
        }

        /*
         * QUANTITY
         */

        .ilm-cart-controls {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-top: 11px;
        }

        .ilm-quantity {
          display: inline-flex;

          align-items: center;

          overflow: hidden;

          border: 1px solid
            #dce3ea;

          border-radius: 6px;

          background: #ffffff;
        }

        .ilm-quantity button {
          width: 29px;
          height: 29px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 0;

          background: #f7f9fb;
          color: #20324c;

          font-size: 17px;

          cursor: pointer;
        }

        .ilm-quantity button:hover {
          background: #eaf0f5;
        }

        .ilm-quantity span {
          min-width: 30px;

          color: #1c2d46;

          font-size: 12px;
          font-weight: 700;

          text-align: center;
        }

        .ilm-remove {
          padding: 0;

          border: 0;

          background: transparent;

          color: #9b4b45;

          font-size: 11px;

          cursor: pointer;
        }

        .ilm-remove:hover {
          text-decoration: underline;
        }

        /*
         * SUMMARY
         */

        .ilm-cart-summary {
          flex: 0 0 auto;

          padding: 22px 26px 26px;

          border-top: 1px solid
            #dfe5eb;

          background: #ffffff;

          box-shadow:
            0 -12px 30px
              rgba(7, 18, 35, 0.07);
        }

        .ilm-summary-row {
          display: flex;

          align-items: center;
          justify-content: space-between;

          color: #516177;

          font-size: 14px;
        }

        .ilm-summary-row strong {
          color: #0d1b32;

          font-size: 20px;
          font-weight: 800;
        }

        .ilm-summary-note {
          margin: 8px 0 17px;

          color: #8490a0;

          font-size: 11px;

          line-height: 1.5;
        }

        /*
         * CHECKOUT BUTTON
         */

        .ilm-checkout-button {
          min-height: 53px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 12px;

          width: 100%;

          padding: 14px 18px;

          border: 1px solid
            #0d1b32;

          border-radius: 7px;

          background: #0d1b32;

          color: #ffffff;

          font-size: 13px;
          font-weight: 800;

          text-decoration: none;

          transition:
            background 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .ilm-checkout-button:hover {
          background: #172b49;

          box-shadow:
            0 8px 20px
              rgba(13, 27, 50, 0.18);

          transform: translateY(-1px);
        }

        /*
         * CONTINUE SHOPPING
         */

        .ilm-shopping-button {
          width: 100%;

          margin-top: 10px;

          min-height: 44px;

          border: 1px solid
            #d7dfe7;

          border-radius: 7px;

          background: #ffffff;

          color: #43536a;

          font-size: 12px;
          font-weight: 700;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .ilm-shopping-button:hover {
          background: #f7f9fb;

          border-color: #b9c5d2;
        }

        /*
         * EMPTY STATE
         */

        .ilm-cart-empty {
          flex: 1;

          display: flex;

          flex-direction: column;

          align-items: center;
          justify-content: center;

          padding: 35px;

          text-align: center;
        }

        .ilm-cart-empty-icon {
          width: 68px;
          height: 68px;

          display: flex;

          align-items: center;
          justify-content: center;

          margin-bottom: 18px;

          border-radius: 50%;

          background: #fdf3d4;

          font-size: 29px;
        }

        .ilm-cart-empty h3 {
          margin: 0 0 8px;

          color: #10213a;

          font-family:
            Georgia,
            'Times New Roman',
            serif;

          font-size: 21px;
        }

        .ilm-cart-empty p {
          max-width: 280px;

          margin: 0 0 22px;

          color: #78869a;

          font-size: 13px;

          line-height: 1.6;
        }

        .ilm-cart-continue {
          min-height: 44px;

          padding: 0 20px;

          border: 0;

          border-radius: 6px;

          background: #b28735;

          color: #ffffff;

          font-size: 12px;
          font-weight: 700;

          cursor: pointer;
        }

        .ilm-cart-continue:hover {
          background: #987329;
        }

        /*
         * MOBILE
         */

        @media (max-width: 600px) {
          .ilm-cart-drawer {
            width: 100vw !important;
          }

          .ilm-cart-header {
            padding:
              21px
              18px
              18px;
          }

          .ilm-cart-items {
            padding:
              4px
              17px
              18px;
          }

          .ilm-cart-summary {
            padding:
              18px
              17px
              21px;
          }

          .ilm-cart-item {
            gap: 12px;
          }

          .ilm-cart-cover {
            flex-basis: 60px;

            width: 60px;
            height: 78px;
          }

          .ilm-cart-header h2 {
            font-size: 23px;
          }
        }
      `}</style>
    </>
  );

  return createPortal(
    drawer,
    document.body
  );
}
