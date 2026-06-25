const usuariosBO = require('../../../roppi.backend.modulos/roppi.backend.modulos.usuarios/usuario.bo.js');

const tokenBlacklist = new Set();

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ exito: false, mensaje: 'Token no proporcionado o formato inválido' });
    }
    const token = authHeader.split(' ')[1];
    
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ exito: false, mensaje: 'Token revocado (Sesión cerrada)' });
    }

    req.usuario = usuariosBO.verificarJWT(token);
    next();
  } catch {
    return res.status(401).json({ exito: false, mensaje: 'Token inválido o expirado' });
  }
}

// Función auxiliar para añadir tokens a la lista negra
authMiddleware.revocarToken = (token) => {
    tokenBlacklist.add(token);
};

module.exports = authMiddleware;