import "dotenv/config";
import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});

client.on("error", (err) => {
  console.log("CLIENT ERROR EVENT:", err.code, err.message);
});

try {
  console.log("Connecting...");
  await client.connect();
  console.log("CONNECTED. Running SELECT 1...");
  const res = await client.query("SELECT 1 as ok");
  console.log("QUERY RESULT:", res.rows);
  await client.end();
  console.log("DONE CLEANLY");
} catch (err) {
  console.log("CAUGHT ERROR:");
  console.log("  message:", err.message);
  console.log("  code:", err.code);
  console.log("  stack:", err.stack);
}
