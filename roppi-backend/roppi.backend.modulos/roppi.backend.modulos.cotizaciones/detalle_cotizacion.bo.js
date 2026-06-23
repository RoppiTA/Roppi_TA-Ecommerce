// roppi.backend.modulos/roppi.backend.modulos.cotizaciones/detalle_cotizacion.bo.js
const detalleCotizacionGateway = require('./detalle_cotizacion.gateway');
const personalizadosGateway = require('../roppi.backend.modulos.productos/personalizados.gateway');
const genericosGateway = require('../roppi.backend.modulos.productos/genericos.gateway');

class DetalleCotizacionBO {

  async obtenerDetallesPorCotizacion(numeroCotizacion, versionCotizacion) {
    return await detalleCotizacionGateway.getDetallesByCotizacion(numeroCotizacion, versionCotizacion);
  }

  async agregarItem(numeroCotizacion, versionCotizacion, idUsuario, { idProducto, cantidad }) {
    const personalizado = await personalizadosGateway.findById(idProducto);
    if (!personalizado) throw new Error("El producto personalizado no existe");
    
    const generico = await genericosGateway.findById(personalizado.id_generico);
    if (cantidad > generico.maximo_stock) {
      throw new Error(`La cantidad sobrepasa el stock máximo de producción de la categoría (${generico.maximo_stock})`);
    }

    const detallesActuales = await this.obtenerDetallesPorCotizacion(numeroCotizacion, versionCotizacion);
    const itemExistente = detallesActuales.find(d => d.id_producto === idProducto);

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      if (nuevaCantidad > generico.maximo_stock) {
         throw new Error(`La cantidad combinada sobrepasa el stock máximo de producción (${generico.maximo_stock})`);
      }
      return await detalleCotizacionGateway.updateCantidadItem(itemExistente.id_producto, numeroCotizacion, versionCotizacion, nuevaCantidad, idUsuario);
    } else {
      return await detalleCotizacionGateway.addItem({
        idProducto,
        numeroCotizacion,
        versionCotizacion,
        cantidad,
        precio: personalizado.precio,
        idUsuario
      });
    }
  }

  async actualizarCantidad(numeroCotizacion, versionCotizacion, idUsuario, idProducto, cantidad) {
    const detalle = await detalleCotizacionGateway.getDetalleById(idProducto, numeroCotizacion, versionCotizacion);
    if (!detalle) throw new Error("Detalle de cotización no encontrado");

    if (cantidad > detalle.maximo_stock) {
      throw new Error(`La cantidad solicitada es mayor al máximo de capacidad de producción (${detalle.maximo_stock})`);
    }

    return await detalleCotizacionGateway.updateCantidadItem(idProducto, numeroCotizacion, versionCotizacion, cantidad, idUsuario);
  }

  async eliminarItem(numeroCotizacion, versionCotizacion, idProducto) {
    const detalle = await detalleCotizacionGateway.getDetalleById(idProducto, numeroCotizacion, versionCotizacion);
    if (!detalle) throw new Error("Detalle no encontrado");
    
    return await detalleCotizacionGateway.removeItem(idProducto, numeroCotizacion, versionCotizacion);
  }

  async vaciarCotizacion(numeroCotizacion, versionCotizacion) {
    await detalleCotizacionGateway.deleteByCotizacion(numeroCotizacion, versionCotizacion);
  }
}

module.exports = new DetalleCotizacionBO();
