require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const USUARIOS_PRUEBA = [
  { nombre: 'Ana', apellido: 'Martínez', correo: 'ana.postora@copart.test', telefono: '5011-1111', password: 'Postor123!' },
  { nombre: 'Luis', apellido: 'Gómez', correo: 'luis.postor@copart.test', telefono: '5022-2222', password: 'Postor123!' },
  { nombre: 'Carla', apellido: 'Reyes', correo: 'carla.postora@copart.test', telefono: '5033-3333', password: 'Postor123!' },
];

function fotos(seed) {
  return Array.from({ length: 5 }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/900/600`);
}

const AHORA = Date.now();
const horas = (h) => new Date(AHORA + h * 3600 * 1000).toISOString();

const VEHICULOS = [
  {
    duenoIdx: 0,
    anio: 2019, tipo_articulo: 'Sedán', marca: 'Toyota', modelo: 'Corolla', motor: '1.8L 4 cilindros',
    transmision: 'Automática', tipo_combustible: 'Gasolina', tren_manejo: 'FWD', num_cilindros: 4,
    nivel_dano: 'verde', descripcion_dano: 'Daño menor en parachoques trasero.',
    fotos: fotos('corolla'), precio_base: 25000,
    fecha_inicio: horas(-1), fecha_cierre: horas(3),
  },
  {
    duenoIdx: 1,
    anio: 2021, tipo_articulo: 'Pickup', marca: 'Ford', modelo: 'F-150', motor: '3.5L V6',
    transmision: 'Automática', tipo_combustible: 'Gasolina', tren_manejo: '4WD', num_cilindros: 6,
    nivel_dano: 'amarillo', descripcion_dano: 'Daño medio en puerta lateral izquierda.',
    fotos: fotos('f150'), precio_base: 60000,
    fecha_inicio: horas(-2), fecha_cierre: horas(5),
  },
  {
    duenoIdx: 2,
    anio: 2017, tipo_articulo: 'SUV', marca: 'Honda', modelo: 'CR-V', motor: '2.4L 4 cilindros',
    transmision: 'Automática', tipo_combustible: 'Gasolina', tren_manejo: 'AWD', num_cilindros: 4,
    nivel_dano: 'rojo', descripcion_dano: 'Pérdida total por colisión frontal, salvamento.',
    fotos: fotos('crv'), precio_base: 22000,
    fecha_inicio: horas(-3), fecha_cierre: horas(0.05), // cierra en ~3 minutos
  },
  {
    duenoIdx: 0,
    anio: 2020, tipo_articulo: 'Hatchback', marca: 'Chevrolet', modelo: 'Spark', motor: '1.4L 4 cilindros',
    transmision: 'Manual', tipo_combustible: 'Gasolina', tren_manejo: 'FWD', num_cilindros: 4,
    nivel_dano: 'verde', descripcion_dano: 'Rayones superficiales en pintura.',
    fotos: fotos('spark'), precio_base: 20000,
    fecha_inicio: horas(1), fecha_cierre: horas(6), // aún no inicia
  },
  {
    duenoIdx: 1,
    anio: 2018, tipo_articulo: 'Sedán', marca: 'Nissan', modelo: 'Versa', motor: '1.6L 4 cilindros',
    transmision: 'Automática', tipo_combustible: 'Gasolina', tren_manejo: 'FWD', num_cilindros: 4,
    nivel_dano: 'amarillo', descripcion_dano: 'Daño en cofre y faro delantero derecho.',
    fotos: fotos('versa'), precio_base: 21000,
    fecha_inicio: horas(-24), fecha_cierre: horas(-1), // ya cerrada (desierta, sin pujas)
  },
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

  console.log('Creando usuarios de prueba...');
  const idsUsuarios = [];
  for (const u of USUARIOS_PRUEBA) {
    const hash = await bcrypt.hash(u.password, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, correo, telefono, password_hash)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (correo) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id`,
      [u.nombre, u.apellido, u.correo, u.telefono, hash]
    );
    idsUsuarios.push(rows[0].id);
  }

  console.log('Creando vehículos y subastas de ejemplo...');
  for (const v of VEHICULOS) {
    const propietarioId = idsUsuarios[v.duenoIdx];
    const { rows: vRows } = await pool.query(
      `INSERT INTO vehiculos (propietario_id, anio, tipo_articulo, marca, modelo, motor, transmision, tipo_combustible, tren_manejo, num_cilindros, nivel_dano, descripcion_dano)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [propietarioId, v.anio, v.tipo_articulo, v.marca, v.modelo, v.motor, v.transmision, v.tipo_combustible, v.tren_manejo, v.num_cilindros, v.nivel_dano, v.descripcion_dano]
    );
    const vehiculoId = vRows[0].id;

    for (let i = 0; i < v.fotos.length; i++) {
      await pool.query('INSERT INTO vehiculo_fotos (vehiculo_id, url, orden) VALUES ($1,$2,$3)', [vehiculoId, v.fotos[i], i]);
    }

    await pool.query(
      `INSERT INTO subastas (vehiculo_id, precio_base, precio_actual, fecha_inicio, fecha_cierre)
       VALUES ($1,$2,$2,$3,$4)`,
      [vehiculoId, v.precio_base, v.fecha_inicio, v.fecha_cierre]
    );
  }

  console.log('\nListo. Usuarios de prueba:');
  USUARIOS_PRUEBA.forEach((u) => console.log(`  - ${u.correo} / ${u.password}`));

  await pool.end();
}

main().catch((err) => {
  console.error('Error al poblar datos:', err);
  process.exit(1);
});
