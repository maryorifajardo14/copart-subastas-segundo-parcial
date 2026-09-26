const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const EXPIRES_IN = '12h';

function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, correo: usuario.correo, nombre: usuario.nombre },
    SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

function verificarToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { firmarToken, verificarToken };
