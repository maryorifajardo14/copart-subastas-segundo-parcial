const { verificarToken } = require('../utils/jwt');

function getTokenFromHeader(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme === 'Bearer' && token) return token;
  return null;
}

// Requiere sesión activa. Usuarios anónimos reciben 401.
function requireAuth(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) {
    return res.status(401).json({ error: 'Debes iniciar sesión para realizar esta acción.' });
  }
  try {
    req.user = verificarToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesión inválida o expirada.' });
  }
}

// No bloquea a usuarios anónimos, pero adjunta req.user si hay token válido.
// Se usa en endpoints de solo lectura para poder calcular "voy ganando"/"fui superado".
function optionalAuth(req, _res, next) {
  const token = getTokenFromHeader(req);
  if (token) {
    try {
      req.user = verificarToken(token);
    } catch (err) {
      // token inválido: se trata como anónimo, no se bloquea la lectura
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
