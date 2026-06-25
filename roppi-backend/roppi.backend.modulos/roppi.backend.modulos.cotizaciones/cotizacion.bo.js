// roppi.backend.modulos/roppi.backend.modulos.cotizaciones/cotizacion.bo.js
const cotizacionGateway = require('./cotizacion.gateway');
const detalleCotizacionBO = require('./detalle_cotizacion.bo');
const descuentoBO = require('../roppi.backend.modulos.productos/descuento.bo');

class CotizacionBO {

  // --- LOGICA DE CARRITO ---

  async obtenerCarritoActivo(idUsuario) {
    let carrito = await cotizacionGateway.getCarritoActivoByCliente(idUsuario);

    if (!carrito) {
      carrito = await cotizacionGateway.createCarrito(idUsuario);
      return { carrito, detalles: [], subtotal: 0, total: 0 };
    }

    const detalles = await detalleCotizacionBO.obtenerDetallesPorCotizacion(carrito.numero_cotizacion, carrito.version_cotizacion);
    let subtotal = 0;
    let totalDescuento = 0;

    for (let det of detalles) {
      const precioTotalItem = det.precio * det.cantidad;
      subtotal += precioTotalItem;

      const descuentos = await descuentoBO.obtenerDescuentosPorIdProducto(det.id_generico);
      let descuentoMaximo = 0;

      if (descuentos && descuentos.length > 0) {
        const mayorDescuento = Math.max(...descuentos.map(d => d.porcentaje || d.porcentajeDescuento || 0));
        const factor = mayorDescuento > 1 ? mayorDescuento / 100 : mayorDescuento;
        descuentoMaximo = precioTotalItem * factor;
      }

      det.descuento_calculado = descuentoMaximo;
      totalDescuento += descuentoMaximo;
    }

    const total = subtotal - totalDescuento;

    // Actualizar el TOTAL en base de datos si varió
    if (carrito.total !== total) {
      await cotizacionGateway.updateTotal(carrito.numero_cotizacion, carrito.version_cotizacion, total, idUsuario);
      carrito.total = total;
    }

    return {
      carrito,
      detalles,
      subtotal,
      descuento: totalDescuento,
      total
    };
  }

  async agregarItemCarrito(idUsuario, { idProducto, cantidad }) {
    if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0");

    let carrito = await cotizacionGateway.getCarritoActivoByCliente(idUsuario);
    if (!carrito) {
      carrito = await cotizacionGateway.createCarrito(idUsuario);
    }

    return await detalleCotizacionBO.agregarItem(carrito.numero_cotizacion, carrito.version_cotizacion, idUsuario, { idProducto, cantidad });
  }

  async actualizarCantidadCarrito(idUsuario, idProducto, cantidad) {
    if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0");

    let carrito = await cotizacionGateway.getCarritoActivoByCliente(idUsuario);
    if (!carrito) throw new Error("Carrito no encontrado");

    return await detalleCotizacionBO.actualizarCantidad(carrito.numero_cotizacion, carrito.version_cotizacion, idUsuario, idProducto, cantidad);
  }

  async eliminarItemCarrito(idUsuario, idProducto) {
    let carrito = await cotizacionGateway.getCarritoActivoByCliente(idUsuario);
    if (!carrito) throw new Error("Carrito no encontrado");

    return await detalleCotizacionBO.eliminarItem(carrito.numero_cotizacion, carrito.version_cotizacion, idProducto);
  }

  async vaciarCarrito(idUsuario) {
    const carrito = await cotizacionGateway.getCarritoActivoByCliente(idUsuario);
    if (carrito) {
      await detalleCotizacionBO.vaciarCotizacion(carrito.numero_cotizacion, carrito.version_cotizacion);
    }
    return { exito: true };
  }

  // --- LOGICA DE COTIZACION ---
  // EN API
  async listarCotizacionesActivasPorCliente(idCliente, page, items_per_page) {
    let indice_min = items_per_page * (page - 1);
    let indice_max = items_per_page * page;

    const cotizaciones = await cotizacionGateway.listarCotizacionesActivasPorCliente(idCliente, indice_min, indice_max);
    return cotizaciones;
  }

  // EN API
  async listarCotizacionesCerradasPorCliente(idCliente, page, items_per_page) {
    let indice_min = items_per_page * (page - 1);
    let indice_max = items_per_page * page;

    const cotizaciones = await cotizacionGateway.listarCotizacionesCerradasPorCliente(idCliente, indice_min, indice_max);
    return cotizaciones;
  }

  //EN API
  async listarTodasLasCotizacionesPorCliente(idCliente, page, items_per_page) {
    let indice_min = items_per_page * (page - 1);
    let indice_max = items_per_page * page;

    const cotizaciones = await cotizacionGateway.listarTodasLasCotizacionesPorCliente(idCliente, indice_min, indice_max);
    return cotizaciones;
  }

  // EN API
  async listarCotizacionesAbiertas(page, items_per_page) {
    let indice_min = items_per_page * (page - 1);
    let indice_max = items_per_page * page;

    const cotizaciones = await cotizacionGateway.listarCotizacionesAbiertas(indice_min, indice_max);
    return cotizaciones;
  }

  // EN API
  async listarCotizacionesCerradas(page, items_per_page) {
    let indice_min = items_per_page * (page - 1);
    let indice_max = items_per_page * page;

    const cotizaciones = await cotizacionGateway.listarCotizacionesCerradas(indice_min, indice_max);
    return cotizaciones;
  }

  // EN API
  async listarTodasLasCotizaciones(page, items_per_page) {
    let indice_min = items_per_page * (page - 1);
    let indice_max = items_per_page * page;

    const cotizaciones = await cotizacionGateway.listarTodasLasCotizaciones(indice_min, indice_max);
    return cotizaciones;
  }

  // EN API
  async listarVersionesDeCotizacion(numero_cotizacion) {
    const versiones_cotizacion = await cotizacionGateway.listarVersionesDeCotizacion(numero_cotizacion);
    return versiones_cotizacion;
  }


  async obtenerDetallesCotizacion(num_cotizacion, num_version) {
    const cotizacion = await cotizacionGateway.obtenerDetallesCotizacion(num_cotizacion, num_version);
    return cotizacion;
  }

  async crearCotizacion({ }) {
    // Acá también tendríamos que llamar a Detalles Cotizacion para hacer la relación

  }

  // EN API
  async updateEstadoCotizacion(num_cotizacion, num_version, estado) {
    const respuesta = await cotizacionGateway.updateEstadoCotizacion(num_cotizacion, num_version, estado);
    return respuesta;
  }
}

module.exports = new CotizacionBO();
