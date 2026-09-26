require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Falta DATABASE_URL en server/.env');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
  });

  const sql = fs.readFileSync(path.join(__dirname, '..', '..', 'db', 'schema.sql'), 'utf8');

  console.log('Aplicando esquema a la base de datos...');
  await pool.query(sql);
  console.log('Esquema aplicado correctamente.');
  await pool.end();
}

main().catch((err) => {
  console.error('Error al migrar:', err);
  process.exit(1);
});
