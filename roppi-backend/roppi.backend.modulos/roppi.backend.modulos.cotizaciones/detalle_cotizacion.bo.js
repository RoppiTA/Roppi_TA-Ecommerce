// roppi.backend.modulos/roppi.backend.modulos.cotizaciones/detalle_cotizacion.bo.js
const detalleCotizacionGateway = require('./detalle_cotizacion.gateway');
const genericosGateway = require('../roppi.backend.modulos.productos/genericos.gateway');

class DetalleCotizacionBO {

  async obtenerDetallesPorCotizacion(numeroCotizacion, versionCotizacion) {
    return await detalleCotizacionGateway.getDetallesByCotizacion(numeroCotizacion, versionCotizacion);
  }

  async agregarItem(numeroCotizacion, versionCotizacion, idUsuario, { idGenerico, cantidad, idTamano, idColor, idMaterial, idPersonalizacion, urlDiseno }) {
    const generico = await genericosGateway.findById(idGenerico);
    if (!generico) throw new Error("El producto genérico no existe");

    if (cantidad > generico.maximo_stock) {
      throw new Error(`La cantidad sobrepasa el stock máximo de producción de la categoría (${generico.maximo_stock})`);
    }

    const detallesActuales = await this.obtenerDetallesPorCotizacion(numeroCotizacion, versionCotizacion);
    // Para simplificar, asumimos que si el mismo genérico ya está en el carrito, se suma la cantidad.
    // En una implementación real más estricta de carrito, tal vez deberíamos verificar si las personalizaciones son idénticas.
    const itemExistente = detallesActuales.find(d => d.id_generico === idGenerico);

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      if (nuevaCantidad > generico.maximo_stock) {
         throw new Error(`La cantidad combinada sobrepasa el stock máximo de producción (${generico.maximo_stock})`);
      }
      return await detalleCotizacionGateway.updateCantidadItem(itemExistente.id_generico, numeroCotizacion, versionCotizacion, nuevaCantidad, idUsuario);
    } else {
      // Tomamos el precio base del genérico. Podría ajustarse sumando los extras de material/personalización en el futuro.
      const precioBase = generico.precio_base || 0;
      return await detalleCotizacionGateway.addItem({
        idGenerico,
        numeroCotizacion,
        versionCotizacion,
        cantidad,
        precio: precioBase,
        idTamano,
        idColor,
        idMaterial,
        idPersonalizacion,
        urlDiseno,
        idUsuario
      });
    }
  }

  async actualizarCantidad(numeroCotizacion, versionCotizacion, idUsuario, idGenerico, cantidad) {
    const detalle = await detalleCotizacionGateway.getDetalleByGenerico(idGenerico, numeroCotizacion, versionCotizacion);
    if (!detalle) throw new Error("Detalle de cotización no encontrado");

    if (cantidad > detalle.maximo_stock) {
      throw new Error(`La cantidad solicitada es mayor al máximo de capacidad de producción (${detalle.maximo_stock})`);
    }

    return await detalleCotizacionGateway.updateCantidadItem(idGenerico, numeroCotizacion, versionCotizacion, cantidad, idUsuario);
  }

  async eliminarItem(numeroCotizacion, versionCotizacion, idGenerico) {
    const detalle = await detalleCotizacionGateway.getDetalleByGenerico(idGenerico, numeroCotizacion, versionCotizacion);
    if (!detalle) throw new Error("Detalle no encontrado");
    
    return await detalleCotizacionGateway.removeItem(idGenerico, numeroCotizacion, versionCotizacion);
  }

  async vaciarCotizacion(numeroCotizacion, versionCotizacion) {
    await detalleCotizacionGateway.deleteByCotizacion(numeroCotizacion, versionCotizacion);
  }
}

module.exports = new DetalleCotizacionBO();
