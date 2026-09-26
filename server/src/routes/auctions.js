const express = require('express');
const pool = require('../db/pool');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const { sincronizarEstados, precioMinimoSiguientePuja } = require('../services/subastas');

const router = express.Router();

const FILTROS_PERMITIDOS = {
  marca: 'v.marca ILIKE $%',
  modelo: 'v.modelo ILIKE $%',
  tipo_articulo: 'v.tipo_articulo ILIKE $%',
  tipo_combustible: 'v.tipo_combustible ILIKE $%',
  tren_manejo: 'v.tren_manejo = $%',
  nivel_dano: 'v.nivel_dano = $%',
  anio: 'v.anio = $%',
  estado: 's.estado = $%',
};

// GET /api/auctions - catálogo público con filtros multitarea
router.get('/', async (req, res) => {
  try {
    await sincronizarEstados();

    const condiciones = [];
    const valores = [];

    for (const [clave, plantilla] of Object.entries(FILTROS_PERMITIDOS)) {
      const valor = req.query[clave];
      if (valor === undefined || valor === '') continue;
      valores.push(clave === 'marca' || clave === 'modelo' || clave === 'tipo_articulo' || clave === 'tipo_combustible' ? `%${valor}%` : valor);
      condiciones.push(plantilla.replace('$%', `$${valores.length}`));
    }

    const q = req.query.q;
    if (q) {
      valores.push(`%${q}%`);
      const idx = valores.length;
      condiciones.push(`(v.marca ILIKE $${idx} OR v.modelo ILIKE $${idx} OR v.tipo_articulo ILIKE $${idx} OR v.motor ILIKE $${idx})`);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT
         s.id AS subasta_id, s.precio_base, s.precio_actual, s.estado,
         s.fecha_inicio, s.fecha_cierre,
         v.id AS vehiculo_id, v.anio, v.tipo_articulo, v.marca, v.modelo,
         v.tipo_combustible, v.transmision, v.tren_manejo, v.num_cilindros, v.nivel_dano,
         (SELECT url FROM vehiculo_fotos f WHERE f.vehiculo_id = v.id ORDER BY f.orden ASC LIMIT 1) AS foto_portada,
         (SELECT COUNT(*) FROM pujas p WHERE p.subasta_id = s.id) AS total_pujas
       FROM subastas s
       JOIN vehiculos v ON v.id = s.vehiculo_id
       ${where}
       ORDER BY s.estado = 'activa' DESC, s.fecha_cierre ASC`,
      valores
    );

    res.json({ subastas: rows });
  } catch (err) {
    console.error('Error en GET /auctions:', err);
    res.status(500).json({ error: 'No se pudo cargar el inventario.' });
  }
});

// GET /api/auctions/:id - detalle de la subasta (ficha técnica + galería + estado de puja)
router.get('/:id', optionalAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await sincronizarEstados();

    const { rows: subastaRows } = await pool.query(
      `SELECT s.*, v.*, s.id AS subasta_id
       FROM subastas s
       JOIN vehiculos v ON v.id = s.vehiculo_id
       WHERE s.id = $1`,
      [id]
    );
    const subasta = subastaRows[0];
    if (!subasta) return res.status(404).json({ error: 'Subasta no encontrada.' });

    const { rows: fotos } = await pool.query(
      'SELECT url FROM vehiculo_fotos WHERE vehiculo_id = $1 ORDER BY orden ASC',
      [subasta.vehiculo_id]
    );

    const { rows: pujas } = await pool.query(
      `SELECT monto, creado_en, postor_id FROM pujas WHERE subasta_id = $1 ORDER BY monto DESC, creado_en ASC`,
      [subasta.subasta_id]
    );

    const puntero = req.user?.id;
    const historial = pujas.map((p) => ({
      monto: p.monto,
      creado_en: p.creado_en,
      es_mia: puntero ? p.postor_id === puntero : false,
    }));

    const pujaGanadora = pujas[0];
    const voyGanando = !!(puntero && pujaGanadora && pujaGanadora.postor_id === puntero);
    const tengoPujas = pujas.some((p) => p.postor_id === puntero);
    const fuiSuperado = !!(puntero && tengoPujas && !voyGanando);
    const soyDueno = !!(puntero && subasta.propietario_id === puntero);

    res.json({
      subasta: {
        id: subasta.subasta_id,
        precio_base: subasta.precio_base,
        precio_actual: subasta.precio_actual,
        precio_minimo_siguiente: precioMinimoSiguientePuja(subasta),
        estado: subasta.estado,
        fecha_inicio: subasta.fecha_inicio,
        fecha_cierre: subasta.fecha_cierre,
        total_pujas: pujas.length,
        historial,
      },
      vehiculo: {
        id: subasta.vehiculo_id,
        anio: subasta.anio,
        tipo_articulo: subasta.tipo_articulo,
        marca: subasta.marca,
        modelo: subasta.modelo,
        motor: subasta.motor,
        transmision: subasta.transmision,
        tipo_combustible: subasta.tipo_combustible,
        tren_manejo: subasta.tren_manejo,
        num_cilindros: subasta.num_cilindros,
        nivel_dano: subasta.nivel_dano,
        descripcion_dano: subasta.descripcion_dano,
        fotos: fotos.map((f) => f.url),
      },
      mi_estado: {
        autenticado: !!puntero,
        soy_dueno: soyDueno,
        voy_ganando: voyGanando,
        fui_superado: fuiSuperado,
      },
    });
  } catch (err) {
    console.error('Error en GET /auctions/:id:', err);
    res.status(500).json({ error: 'No se pudo cargar la subasta.' });
  }
});

// POST /api/auctions/:id/bids - registrar una puja
router.post('/:id/bids', requireAuth, async (req, res) => {
  const { id } = req.params;
  const monto = Number(req.body?.monto);

  if (!monto || Number.isNaN(monto) || monto <= 0) {
    return res.status(400).json({ error: 'El monto de la oferta no es válido.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await sincronizarEstados();

    const { rows } = await client.query(
      `SELECT s.*, v.propietario_id
       FROM subastas s JOIN vehiculos v ON v.id = s.vehiculo_id
       WHERE s.id = $1 FOR UPDATE`,
      [id]
    );
    const subasta = rows[0];
    if (!subasta) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Subasta no encontrada.' });
    }

    if (subasta.propietario_id === req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'No puedes ofertar en tu propio vehículo.' });
    }

    if (subasta.estado === 'pendiente') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'La subasta aún no ha iniciado.' });
    }
    if (subasta.estado !== 'activa') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'La subasta ya ha finalizado.' });
    }

    const minimoSiguiente = precioMinimoSiguientePuja(subasta);
    if (monto < Number(subasta.precio_base)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `La oferta debe ser mayor al precio base (Q ${Number(subasta.precio_base).toLocaleString('es-GT')}).` });
    }
    if (monto < minimoSiguiente) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `La oferta debe superar la puja actual por al menos 10% (mínimo Q ${minimoSiguiente.toLocaleString('es-GT')}).`,
      });
    }

    await client.query(
      'INSERT INTO pujas (subasta_id, postor_id, monto) VALUES ($1, $2, $3)',
      [id, req.user.id, monto]
    );
    await client.query('UPDATE subastas SET precio_actual = $1 WHERE id = $2', [monto, id]);

    await client.query('COMMIT');
    res.status(201).json({ ok: true, precio_actual: monto });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en POST /auctions/:id/bids:', err);
    res.status(500).json({ error: 'No se pudo registrar la oferta.' });
  } finally {
    client.release();
  }
});

module.exports = router;
