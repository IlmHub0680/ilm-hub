-- Real author profile + standing payout preference fields, replacing
-- the fabricated "Dr. Ahmad Al-Mansoor" placeholder values that were
-- previously hardcoded only in app/author-portal/admission/page.jsx
-- frontend state and never persisted anywhere.
--
-- Added to AuthorAdmission (the existing per-user, @unique-on-userId
-- "I am an author" record) rather than to User, since bio/specialty/
-- payout preference are author-specific, not relevant to every
-- account type on this platform.
--
-- All columns are nullable: existing AuthorAdmission rows have none
-- of this data today, and we never fabricate a default for them.

-- CreateEnum
CREATE TYPE "AuthorPayoutMethodPreference" AS ENUM ('BANK_TRANSFER', 'MOBILE_MONEY');

-- AlterTable
ALTER TABLE "AuthorAdmission"
  ADD COLUMN "bio" TEXT,
  ADD COLUMN "specialty" TEXT,
  ADD COLUMN "payoutMethodPreference" "AuthorPayoutMethodPreference",
  -- Bank transfer destination. Free-text bank name (no hardcoded
  -- bank list, consistent with countryOfResidence already being
  -- free text rather than a hardcoded country picker). NOTE: stored
  -- as plain, unencrypted-at-rest text, same as this codebase's
  -- other free-text contact/identifier fields (no existing
  -- precedent for encrypting an account-number-shaped field was
  -- found in this schema) -- anything that reads bankAccountNumber
  -- must treat it as sensitive author-supplied banking information
  -- and only expose it to staff who need it, never in a general/
  -- public API response.
  ADD COLUMN "bankName" TEXT,
  ADD COLUMN "bankAccountNumber" TEXT,
  -- Mobile money destination. Provider is free text (no hardcoded
  -- network list), same reasoning as bank name above.
  ADD COLUMN "momoProvider" TEXT,
  ADD COLUMN "momoNumber" TEXT;
