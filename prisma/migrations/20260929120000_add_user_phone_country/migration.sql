-- Adds optional contact/profile fields collected at signup
-- (bookstore/media accounts): phone number and a plain free-text
-- country/location label. Both nullable, so every existing account
-- stays valid with no backfill needed. countryName is deliberately
-- separate from the existing countryId relation to the Country
-- table, which is real seeded reference data used for currency /
-- exchange-rate purposes elsewhere in the app.

-- AlterTable
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "countryName" TEXT;
