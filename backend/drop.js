import pg from 'pg';

const client = new pg.Client({
  user: 'umang',
  password: 'secret123',
  host: 'localhost',
  port: 5432,
  database: 'crud_demo',
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
