import 'dotenv/config';
import pg from 'pg';

const requiredEnvVars = ['DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required env vars: ${missingEnvVars.join(', ')}`);
}

const client = new pg.Client({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
});

async function run() {
  await client.connect();
  console.log('Connected');
  await client.query('DROP TABLE IF EXISTS todos CASCADE');
  await client.query('DROP TABLE IF EXISTS users CASCADE');
  console.log('Tables dropped');
  await client.end();
}

run().catch(console.error);
