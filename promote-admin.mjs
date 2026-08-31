import "dotenv/config";
import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DIRECT_URL
});

await client.connect();

const result = await client.query(`
  UPDATE "User"
  SET
    role = 'ADMIN',
    "authorStatus" = 'APPROVED',
    "updatedAt" = NOW()
  WHERE email = $1
  RETURNING id, name, email, role, "authorStatus"
`, ["imammuhammad0680@gmail.com"]);

console.log(JSON.stringify(result.rows, null, 2));

await client.end();
