-- Security audit fix: session revocation. Adds a per-user token
-- version so that a password change (or a future "log out of all
-- devices" action) can invalidate every previously-issued session
-- token instantly, without a server-side session table.

-- AlterTable
ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
