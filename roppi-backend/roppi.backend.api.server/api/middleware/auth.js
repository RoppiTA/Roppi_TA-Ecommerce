const usuariosBO = require('../../../roppi.backend.modulos/roppi.backend.modulos.usuarios/usuario.bo.js');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ exito: false, mensaje: 'Token no proporcionado o formato inválido' });
    }
    const token = authHeader.split(' ')[1];
    req.usuario = usuariosBO.verificarJWT(token);
    next();
  } catch {
    return res.status(401).json({ exito: false, mensaje: 'Token inválido o expirado' });
  }
}

module.exports = authMiddleware;