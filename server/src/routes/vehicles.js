const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const NIVELES_DANO = ['verde', 'amarillo', 'rojo'];
const TRENES = ['AWD', 'FWD', 'RWD', '4WD'];
const PRECIO_BASE_MINIMO = 20000;

function validarVehiculo(body) {
  const {
    anio, tipo_articulo, marca, modelo, motor, transmision,
    tipo_combustible, tren_manejo, num_cilindros, nivel_dano,
    fotos, precio_base, fecha_inicio, fecha_cierre,
  } = body;

  if (!anio || !tipo_articulo || !marca || !modelo || !motor || !transmision || !tipo_combustible || !tren_manejo || !num_cilindros || !nivel_dano) {
    return 'Todos los campos de la ficha técnica son obligatorios.';
  }
  if (!TRENES.includes(tren_manejo)) return 'Tren de manejo inválido (use AWD, FWD, RWD o 4WD).';
  if (!NIVELES_DANO.includes(nivel_dano)) return 'Nivel de daño inválido (use verde, amarillo o rojo).';
  if (!Array.isArray(fotos) || fotos.length < 5) return 'Debes incluir al menos 5 fotografías del vehículo.';
  if (fotos.some((f) => typeof f !== 'string' || !f.trim())) return 'Todas las fotografías deben ser URLs válidas.';
  if (!precio_base || Number(precio_base) < PRECIO_BASE_MINIMO) return `El precio base debe ser de al menos Q ${PRECIO_BASE_MINIMO.toLocaleString('es-GT')}.`;
  if (!fecha_inicio || !fecha_cierre) return 'Debes indicar fecha/hora de inicio y de cierre de la subasta.';
  if (new Date(fecha_cierre) <= new Date(fecha_inicio)) return 'La fecha de cierre debe ser posterior a la fecha de inicio.';
  return null;
}

// POST /api/vehicles - publicar vehículo + parámetros de subasta
router.post('/', requireAuth, async (req, res) => {
  const error = validarVehiculo(req.body || {});
  if (error) return res.status(400).json({ error });

  const {
    anio, tipo_articulo, marca, modelo, motor, transmision,
    tipo_combustible, tren_manejo, num_cilindros, nivel_dano, descripcion_dano,
    fotos, precio_base, fecha_inicio, fecha_cierre,
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: vRows } = await client.query(
      `INSERT INTO vehiculos
        (propietario_id, anio, tipo_articulo, marca, modelo, motor, transmision, tipo_combustible, tren_manejo, num_cilindros, nivel_dano, descripcion_dano)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id`,
      [req.user.id, anio, tipo_articulo, marca, modelo, motor, transmision, tipo_combustible, tren_manejo, num_cilindros, nivel_dano, descripcion_dano || null]
    );
    const vehiculoId = vRows[0].id;

    for (let i = 0; i < fotos.length; i++) {
      await client.query('INSERT INTO vehiculo_fotos (vehiculo_id, url, orden) VALUES ($1,$2,$3)', [vehiculoId, fotos[i], i]);
    }

    const { rows: sRows } = await client.query(
      `INSERT INTO subastas (vehiculo_id, precio_base, precio_actual, fecha_inicio, fecha_cierre)
       VALUES ($1,$2,$2,$3,$4) RETURNING id`,
      [vehiculoId, precio_base, fecha_inicio, fecha_cierre]
    );

    await client.query('COMMIT');
    res.status(201).json({ vehiculo_id: vehiculoId, subasta_id: sRows[0].id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en POST /vehicles:', err);
    res.status(500).json({ error: 'No se pudo publicar el vehículo.' });
  } finally {
    client.release();
  }
});

// GET /api/vehicles/mine - mis publicaciones (con búsqueda opcional)
router.get('/mine', requireAuth, async (req, res) => {
  const { q } = req.query;
  try {
    const condiciones = ['v.propietario_id = $1'];
    const valores = [req.user.id];
    if (q) {
      valores.push(`%${q}%`);
      condiciones.push(`(v.marca ILIKE $${valores.length} OR v.modelo ILIKE $${valores.length})`);
    }
    const { rows } = await pool.query(
      `SELECT v.id AS vehiculo_id, v.anio, v.marca, v.modelo, v.tipo_articulo, v.nivel_dano,
              s.id AS subasta_id, s.estado, s.precio_base, s.precio_actual, s.fecha_inicio, s.fecha_cierre,
              (SELECT url FROM vehiculo_fotos f WHERE f.vehiculo_id = v.id ORDER BY f.orden ASC LIMIT 1) AS foto_portada
       FROM vehiculos v
       JOIN subastas s ON s.vehiculo_id = v.id
       WHERE ${condiciones.join(' AND ')}
       ORDER BY v.creado_en DESC`,
      valores
    );
    res.json({ vehiculos: rows });
  } catch (err) {
    console.error('Error en GET /vehicles/mine:', err);
    res.status(500).json({ error: 'No se pudieron cargar tus publicaciones.' });
  }
});

// GET /api/vehicles/:id - detalle propio para edición
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT v.*, s.id AS subasta_id, s.precio_base, s.estado, s.fecha_inicio, s.fecha_cierre
       FROM vehiculos v JOIN subastas s ON s.vehiculo_id = v.id
       WHERE v.id = $1`,
      [req.params.id]
    );
    const vehiculo = rows[0];
    if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado.' });
    if (vehiculo.propietario_id !== req.user.id) return res.status(403).json({ error: 'No tienes acceso a este vehículo.' });

    const { rows: fotos } = await pool.query('SELECT url FROM vehiculo_fotos WHERE vehiculo_id = $1 ORDER BY orden ASC', [req.params.id]);
    res.json({ vehiculo: { ...vehiculo, fotos: fotos.map((f) => f.url) } });
  } catch (err) {
    console.error('Error en GET /vehicles/:id:', err);
    res.status(500).json({ error: 'No se pudo cargar el vehículo.' });
  }
});

// PUT /api/vehicles/:id - editar publicación propia (solo mientras la subasta no ha iniciado)
router.put('/:id', requireAuth, async (req, res) => {
  const error = validarVehiculo(req.body || {});
  if (error) return res.status(400).json({ error });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT v.propietario_id, s.id AS subasta_id, s.estado
       FROM vehiculos v JOIN subastas s ON s.vehiculo_id = v.id
       WHERE v.id = $1 FOR UPDATE`,
      [req.params.id]
    );
    const actual = rows[0];
    if (!actual) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Vehículo no encontrado.' }); }
    if (actual.propietario_id !== req.user.id) { await client.query('ROLLBACK'); return res.status(403).json({ error: 'No tienes acceso a este vehículo.' }); }
    if (actual.estado !== 'pendiente') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Ya no puedes editar esta publicación porque la subasta ya inició o finalizó.' });
    }

    const {
      anio, tipo_articulo, marca, modelo, motor, transmision,
      tipo_combustible, tren_manejo, num_cilindros, nivel_dano, descripcion_dano,
      fotos, precio_base, fecha_inicio, fecha_cierre,
    } = req.body;

    await client.query(
      `UPDATE vehiculos SET anio=$1, tipo_articulo=$2, marca=$3, modelo=$4, motor=$5, transmision=$6,
        tipo_combustible=$7, tren_manejo=$8, num_cilindros=$9, nivel_dano=$10, descripcion_dano=$11, actualizado_en=now()
       WHERE id=$12`,
      [anio, tipo_articulo, marca, modelo, motor, transmision, tipo_combustible, tren_manejo, num_cilindros, nivel_dano, descripcion_dano || null, req.params.id]
    );

    await client.query('DELETE FROM vehiculo_fotos WHERE vehiculo_id = $1', [req.params.id]);
    for (let i = 0; i < fotos.length; i++) {
      await client.query('INSERT INTO vehiculo_fotos (vehiculo_id, url, orden) VALUES ($1,$2,$3)', [req.params.id, fotos[i], i]);
    }

    await client.query(
      'UPDATE subastas SET precio_base=$1, precio_actual=$1, fecha_inicio=$2, fecha_cierre=$3 WHERE id=$4',
      [precio_base, fecha_inicio, fecha_cierre, actual.subasta_id]
    );

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en PUT /vehicles/:id:', err);
    res.status(500).json({ error: 'No se pudo actualizar el vehículo.' });
  } finally {
    client.release();
  }
});

// DELETE /api/vehicles/:id - eliminar publicación propia (solo si aún no inicia)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT v.propietario_id, s.estado FROM vehiculos v JOIN subastas s ON s.vehiculo_id = v.id WHERE v.id = $1`,
      [req.params.id]
    );
    const actual = rows[0];
    if (!actual) return res.status(404).json({ error: 'Vehículo no encontrado.' });
    if (actual.propietario_id !== req.user.id) return res.status(403).json({ error: 'No tienes acceso a este vehículo.' });
    if (actual.estado !== 'pendiente') return res.status(409).json({ error: 'No puedes eliminar una subasta que ya inició o finalizó.' });

    await pool.query('DELETE FROM vehiculos WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error en DELETE /vehicles/:id:', err);
    res.status(500).json({ error: 'No se pudo eliminar el vehículo.' });
  }
});

module.exports = router;
