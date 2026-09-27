const fs = require('fs');
const { Client } = require('pg');

const envContent = fs.readFileSync('.env', 'utf8');
const match = envContent.match(/^DIRECT_URL=(.*)$/m);
const directUrl = match ? match[1].replace(/^"|"$/g, '') : null;

if (!directUrl) {
  console.log('DIRECT_URL not found in .env');
  process.exit(1);
}

const client = new Client({
  connectionString: directUrl,
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => client.query('SELECT 1 as ok'))
  .then((res) => {
    console.log('CONNECTED:', JSON.stringify(res.rows));
    return client.end();
  })
  .catch((err) => {
    console.log('CONNECTION FAILED:', err.message);
    process.exit(1);
  });
