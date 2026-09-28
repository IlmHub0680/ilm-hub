import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.log("POOL ERROR EVENT:", err.code, err.message);
});

try {
  console.log("Querying via Pool...");
  const res = await pool.query("SELECT 1 as ok");
  console.log("QUERY RESULT:", res.rows);
  await pool.end();
  console.log("DONE CLEANLY");
} catch (err) {
  console.log("CAUGHT ERROR:");
  console.log("  message:", err.message);
  console.log("  code:", err.code);
}
