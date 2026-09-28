import "dotenv/config";
import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DIRECT_URL
});

await client.connect();

/*
 * Grants real SUPER_ADMIN access through the actual RBAC system
 * (the User.role column that requireAdmin()/lib/auth.ts checks) —
 * not a frontend/hardcoded email check. Run this once from a machine
 * that can actually reach the database (this repo's own device-bridge
 * sandbox cannot — it has no network route to the DB).
 */
const result = await client.query(`
  UPDATE "User"
  SET
    role = 'SUPER_ADMIN',
    "authorStatus" = 'APPROVED',
    "updatedAt" = NOW()
  WHERE email = $1
  RETURNING id, name, email, role, "authorStatus"
`, ["imammuhammad0680@gmail.com"]);

if (result.rows.length === 0) {
  console.error(
    "No User row found for imammuhammad0680@gmail.com — register/sign in with that email first, then re-run this script."
  );
} else {
  console.log(JSON.stringify(result.rows, null, 2));
}

await client.end();
