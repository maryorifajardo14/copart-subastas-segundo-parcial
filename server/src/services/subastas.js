const pool = require('../db/pool');

const INCREMENTO_MINIMO = 0.10; // 10%

// "Tick" perezoso: actualiza estados vencidos en toda la tabla con 2 queries,
// sin necesidad de un cron/worker separado (no viable en funciones serverless).
async function sincronizarEstados() {
  await pool.query(`
    UPDATE subastas
    SET estado = 'activa'::estado_subasta
    WHERE estado = 'pendiente'::estado_subasta
      AND fecha_inicio <= now()
      AND fecha_cierre > now()
  `);

  await pool.query(`
    UPDATE subastas s
    SET estado = (CASE WHEN g.postor_id IS NOT NULL THEN 'cerrada_vendida' ELSE 'cerrada_desierta' END)::estado_subasta,
        ganador_id = g.postor_id
    FROM (
      SELECT DISTINCT ON (subasta_id) subasta_id, postor_id
      FROM pujas
      ORDER BY subasta_id, monto DESC, creado_en ASC
    ) g
    WHERE s.id = g.subasta_id
      AND s.estado IN ('pendiente'::estado_subasta, 'activa'::estado_subasta)
      AND s.fecha_cierre <= now()
  `);

  // subastas sin ninguna puja que también deben cerrarse como desiertas
  await pool.query(`
    UPDATE subastas s
    SET estado = 'cerrada_desierta'::estado_subasta
    WHERE s.estado IN ('pendiente'::estado_subasta, 'activa'::estado_subasta)
      AND s.fecha_cierre <= now()
      AND NOT EXISTS (SELECT 1 FROM pujas p WHERE p.subasta_id = s.id)
  `);
}

function precioMinimoSiguientePuja(subasta) {
  const base = Number(subasta.precio_actual);
  return Math.round(base * (1 + INCREMENTO_MINIMO) * 100) / 100;
}

module.exports = { sincronizarEstados, precioMinimoSiguientePuja, INCREMENTO_MINIMO };
