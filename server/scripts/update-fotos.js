require('dotenv').config();
const { Pool } = require('pg');
const { FOTOS_VEHICULOS } = require('./fotos-vehiculos');

// Reemplaza las fotos de los vehículos de ejemplo ya sembrados por las fotos reales
// correspondientes, sin volver a crear usuarios, vehículos ni subastas.
const VEHICULOS = [
  { marca: 'Toyota', modelo: 'Corolla', anio: 2019, clave: 'corolla' },
  { marca: 'Ford', modelo: 'F-150', anio: 2021, clave: 'f150' },
  { marca: 'Honda', modelo: 'CR-V', anio: 2017, clave: 'crv' },
  { marca: 'Chevrolet', modelo: 'Spark', anio: 2020, clave: 'spark' },
  { marca: 'Nissan', modelo: 'Versa', anio: 2018, clave: 'versa' },
];

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

  for (const v of VEHICULOS) {
    // Solo vehículos con fotos de ejemplo (picsum), para no tocar publicaciones reales de usuarios.
    const { rows } = await pool.query(
      `SELECT DISTINCT v.id FROM vehiculos v
       JOIN vehiculo_fotos f ON f.vehiculo_id = v.id
       WHERE v.marca = $1 AND v.modelo = $2 AND v.anio = $3 AND f.url LIKE 'https://picsum.photos/%'`,
      [v.marca, v.modelo, v.anio]
    );
    for (const { id } of rows) {
      await pool.query('DELETE FROM vehiculo_fotos WHERE vehiculo_id = $1', [id]);
      const fotos = FOTOS_VEHICULOS[v.clave];
      for (let i = 0; i < fotos.length; i++) {
        await pool.query('INSERT INTO vehiculo_fotos (vehiculo_id, url, orden) VALUES ($1,$2,$3)', [id, fotos[i], i]);
      }
    }
    console.log(`${v.marca} ${v.modelo} ${v.anio}: ${rows.length} vehículo(s) actualizado(s)`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error('Error al actualizar fotos:', err);
  process.exit(1);
});
