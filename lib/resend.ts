import { Resend } from 'resend';

// Single Resend client for the whole app. There used to be two copies
// of this file (lib/resend.js and lib/resend.ts, byte-for-byte the
// same client) and neither was ever actually imported anywhere --
// this is the first real usage (Admissions decision emails). Keeping
// only the .ts version now that there is a real consumer, so a
// second, silently-diverging copy can't reappear.
//
// process.env.RESEND_API_KEY is required for outgoing mail to
// actually deliver. Until it's set in .env, this falls back to a
// mock key so the app still builds and runs -- isResendConfigured
// below is what callers should check before relying on a send
// actually going out, rather than assuming a mock key silently works.
export const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export const isResendConfigured = Boolean(process.env.RESEND_API_KEY);
