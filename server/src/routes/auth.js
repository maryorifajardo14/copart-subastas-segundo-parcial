const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { firmarToken } = require('../utils/jwt');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function validarRegistro({ nombre, apellido, correo, telefono, password }) {
  if (!nombre || !apellido || !correo || !telefono || !password) {
    return 'Todos los campos son obligatorios: nombre, apellido, correo, teléfono y contraseña.';
  }
  if (!/^\S+@\S+\.\S+$/.test(correo)) return 'El correo electrónico no es válido.';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  return null;
}

router.post('/register', async (req, res) => {
  const { nombre, apellido, correo, telefono, password } = req.body || {};
  const error = validarRegistro(req.body || {});
  if (error) return res.status(400).json({ error });

  try {
    const existente = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo.toLowerCase()]);
    if (existente.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo electrónico.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, correo, telefono, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, apellido, correo, telefono`,
      [nombre, apellido, correo.toLowerCase(), telefono, passwordHash]
    );

    const usuario = rows[0];
    const token = firmarToken(usuario);
    res.status(201).json({ token, usuario });
  } catch (err) {
    console.error('Error en /register:', err);
    res.status(500).json({ error: 'No se pudo completar el registro.' });
  }
});

router.post('/login', async (req, res) => {
  const { correo, password } = req.body || {};
  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo.toLowerCase()]);
    const usuario = rows[0];
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const token = firmarToken(usuario);
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        telefono: usuario.telefono,
      },
    });
  } catch (err) {
    console.error('Error en /login:', err);
    res.status(500).json({ error: 'No se pudo iniciar sesión.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, apellido, correo, telefono FROM usuarios WHERE id = $1',
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json({ usuario: rows[0] });
  } catch (err) {
    console.error('Error en /me:', err);
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
});

module.exports = router;
