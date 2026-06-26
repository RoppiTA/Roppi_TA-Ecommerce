// Elemento visual: Vista del carrito de compras del cliente
// Muestra la tabla de ítems personalizados, permite editar cantidades,
// y presenta un resumen de costos con opciones para proceder a compra o cotización

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Tag, Trash2 } from 'lucide-react';
import { useCarrito } from '../../context/CarritoContext';
import assets from '../../assets/assets.js';

const cardCls =
  'bg-white rounded-[20px] border border-[#C8E6E8] shadow-[0_2px_16px_rgba(61,30,8,0.06)]';
const labelCls = 'text-[10px] font-bold uppercase tracking-wide text-brand-muted block';

export const ProductCart = () => {
  // Entidad: LineaCarrito[] — ítems del carrito obtenidos desde el contexto global
  const { items, totalItems, updateCantidad, removeItem } = useCarrito();
  const navigate = useNavigate();

  // Control de edición local de cantidades (antes de confirmar con blur o enter)
  const [cantidadEdicion, setCantidadEdicion] = useState<Record<number, string>>({});
  const [cantidadError, setCantidadError] = useState<Record<number, boolean>>({});

  // ── Cálculo del resumen de costos ──────────────────────────────────────────
  // Entidad: LineaCarrito — totalBruto es la suma sin descuentos
  const totalBruto = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);
  const totalDescuentos = items.reduce(
    (acc, i) => acc + (i.descuentoAplicado?.montoDescontado ?? 0),
    0
  );
  
  const productosBase = (totalBruto - totalDescuentos)*0.82;
  const igv = totalBruto * 0.18;
  const precioConDescuentos = productosBase + igv;

  // ── Handlers de cantidad ───────────────────────────────────────────────────

  const getEdicionValue = (linea: number, cantidadActual: number): string =>
    cantidadEdicion[linea] !== undefined ? cantidadEdicion[linea] : String(cantidadActual);

  const handleCantidadInput = (linea: number, raw: string, maximoStock: number) => {
    const cleaned = raw.replace(/\D/g, '');
    setCantidadEdicion((prev) => ({ ...prev, [linea]: cleaned }));
    const val = parseInt(cleaned, 10);
    setCantidadError((prev) => ({ ...prev, [linea]: !isNaN(val) && val > maximoStock }));
  };

  const handleCantidadCommit = (linea: number, maximoStock: number) => {
    const raw = cantidadEdicion[linea];
    if (raw === undefined) return;
    const val = parseInt(raw, 10);
    const cantidad = isNaN(val) || val < 1 ? 1 : Math.min(val, maximoStock);
    updateCantidad(linea, cantidad);
    setCantidadEdicion((prev) => {
      const next = { ...prev };
      delete next[linea];
      return next;
    });
    setCantidadError((prev) => {
      const next = { ...prev };
      delete next[linea];
      return next;
    });
  };

  const handleMenos = (linea: number, cantidadActual: number) => {
    if (cantidadActual <= 1) return;
    updateCantidad(linea, cantidadActual - 1);
  };

  const handleMas = (linea: number, cantidadActual: number, maximoStock: number) => {
    if (cantidadActual >= maximoStock) return;
    updateCantidad(linea, cantidadActual + 1);
  };

  // ── Estado vacío ───────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center">
          <ShoppingCart size={36} className="text-primary2" />
        </div>
        <h2 className="text-xl font-bold text-brand-dark">Tu carrito está vacío</h2>
        <p className="text-sm text-brand-muted max-w-xs">
          Explora el catálogo y personaliza productos para agregarlos aquí.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="mt-2 px-6 py-2.5 bg-primary2 text-white font-bold text-sm rounded-xl hover:bg-primary-hover transition-colors"
        >
          Ir al catálogo
        </button>
      </div>
    );
  }

  return (
    // Elemento visual: layout de dos columnas — tabla a la izquierda, resumen a la derecha
    <div
      className="min-h-full bg-gray-50/50 p-4 lg:p-6"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* Cabecera */}
      <div className="mb-5">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-1.5 text-primary2 hover:text-primary-hover text-sm font-medium transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          Seguir comprando
        </button>
        <h1 className="text-xl font-bold text-brand-dark">
          Carrito de Compra
          <span className="ml-2 text-sm font-semibold text-brand-muted">
            ({totalItems} {totalItems === 1 ? 'ítem' : 'ítems'})
          </span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">

        {/* ── Columna izquierda: tabla de ítems ────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className={`${cardCls} overflow-hidden`}>
            <div className="overflow-x-auto">
              {/* Elemento visual: tabla de ítems del carrito */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-light border-b border-[#C8E6E8]">
                    <th className="text-left px-5 py-3 min-w-[180px]">
                      <span className={labelCls}>Producto</span>
                    </th>
                    <th className="text-left px-3 py-3 min-w-[160px]">
                      <span className={labelCls}>Configuración</span>
                    </th>
                    <th className="text-center px-3 py-3 min-w-[110px]">
                      <span className={labelCls}>Cantidad</span>
                    </th>
                    <th className="text-right px-3 py-3 whitespace-nowrap">
                      <span className={labelCls}>Precio Unit.</span>
                    </th>
                    <th className="text-right px-5 py-3 min-w-[130px]">
                      <span className={labelCls}>Precio Total</span>
                    </th>
                    <th className="px-3 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C8E6E8]">
                  {items.map((item) => {
                    const imgSrc =
                      assets[item.imagenKey as keyof typeof assets] ?? assets['maxwell'];

                    return (
                      <tr key={item.numeroLinea} className="hover:bg-[#E2F4F5] transition-colors">

                        {/* Producto: imagen pequeña + nombre */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={imgSrc}
                              alt={item.nombre}
                              className="w-10 h-10 rounded-lg object-cover border border-primary-hover/10 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-brand-dark leading-tight">
                                {item.nombre}
                              </p>
                              <p className="text-[10px] text-brand-muted mt-0.5">
                                #{item.productoId}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Configuración: badges de atributos de personalización */}
                        <td className="px-3 py-4">
                          <div className="flex flex-col gap-1">
                            {/* Fila 1: talla + material */}
                            <div className="flex flex-wrap gap-1">
                              {item.atributos.talla && (
                                <span className="bg-brand-light/60 text-brand-muted text-[10px] font-semibold rounded px-1.5 py-0.5">
                                  T: {item.atributos.talla}
                                </span>
                              )}
                              {item.atributos.material && (
                                <span className="bg-brand-light/60 text-brand-muted text-[10px] font-semibold rounded px-1.5 py-0.5">
                                  {item.atributos.material}
                                </span>
                              )}
                            </div>
                            {/* Fila 2: color + personalización */}
                            <div className="flex flex-wrap gap-1">
                              {item.atributos.color && (
                                <span className="flex items-center gap-1 bg-brand-light/60 text-brand-muted text-[10px] font-semibold rounded px-1.5 py-0.5">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                    style={{ backgroundColor: item.atributos.colorHex }}
                                  />
                                  {item.atributos.color}
                                </span>
                              )}
                              {item.atributos.personalizacion && (
                                <span className="bg-primary2/10 text-primary-hover text-[10px] font-semibold rounded px-1.5 py-0.5">
                                  {item.atributos.personalizacion}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Cantidad: input editable con validación */}
                        <td className="px-3 py-4">
                          <div className="flex flex-col items-center gap-1">
                            <div className={`flex items-center border rounded-lg ${cantidadError[item.numeroLinea] ? 'border-red-400' : 'border-primary-hover/20'}`}>
                              <button
                                onClick={() =>
                                  handleMenos(item.numeroLinea, item.cantidad)
                                }
                                disabled={item.cantidad <= 1}
                                className="w-7 h-7 flex items-center justify-center text-brand-dark hover:bg-brand-light/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-l-lg"
                              >
                                <Minus size={13} />
                              </button>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={getEdicionValue(item.numeroLinea, item.cantidad)}
                                onChange={(e) =>
                                  handleCantidadInput(item.numeroLinea, e.target.value, item.maximoStock)
                                }
                                onBlur={() =>
                                  handleCantidadCommit(item.numeroLinea, item.maximoStock)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter')
                                    handleCantidadCommit(item.numeroLinea, item.maximoStock);
                                }}
                                className="w-10 text-center text-sm font-semibold text-brand-dark bg-transparent outline-none"
                              />
                              <button
                                onClick={() =>
                                  handleMas(item.numeroLinea, item.cantidad, item.maximoStock)
                                }
                                disabled={item.cantidad >= item.maximoStock}
                                className="w-7 h-7 flex items-center justify-center text-brand-dark hover:bg-brand-light/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-r-lg"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            <span className={`text-[9px] ${cantidadError[item.numeroLinea] ? 'text-red-500 font-semibold' : 'text-brand-muted/70'}`}>
                              Máx. {item.maximoStock}
                            </span>
                            {cantidadError[item.numeroLinea] && (
                              <span className="text-[9px] text-red-500 text-center leading-tight">
                                No puede exceder la capacidad máxima
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Precio unitario */}
                        <td className="px-3 py-4 text-right">
                          <span className="text-sm text-brand-muted font-medium">
                            S/ {item.precioUnitario.toFixed(2)}
                          </span>
                        </td>

                        {/* Precio total de la línea: bruto + etiqueta de descuento si aplica */}
                        <td className="px-5 py-4 text-right">
                          <span className="font-bold text-brand-dark">
                            S/ {(item.precioUnitario * item.cantidad).toFixed(2)}
                          </span>
                          {item.descuentoAplicado && (
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <Tag size={10} className="text-[#F97316]" />
                              <span className="text-[10px] font-semibold text-[#F97316] whitespace-nowrap">
                                −S/ {item.descuentoAplicado.montoDescontado.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Botón eliminar línea */}
                        <td className="px-3 py-4">
                          <button
                            onClick={() => removeItem(item.numeroLinea)}
                            className="w-7 h-7 flex items-center justify-center text-brand-muted/60 hover:text-brand-error hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar del carrito"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Columna derecha: resumen + acciones ──────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">

          {/* Elemento visual: card de resumen de costos */}
          <div className={`${cardCls} p-5`}>
            <p className={`${labelCls} mb-4`}>Resumen de Orden</p>

            <div className="space-y-2.5 text-sm">
              {/* Subtotal: precio bruto tachado → precio con descuento */}
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span>
                <div className="text-right">
                  {totalDescuentos > 0 && (
                    <span className="line-through text-brand-muted/50 text-xs mr-1.5">
                      S/ {totalBruto.toFixed(2)}
                    </span>
                  )}
                  <span className="font-semibold">S/ {precioConDescuentos.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-[#C8E6E8] pt-2.5 space-y-2.5">
                {/* Productos: 82% del precio con descuentos */}
                <div className="flex justify-between text-brand-muted">
                  <span>Productos</span>
                  <span className="font-semibold">S/ {productosBase.toFixed(2)}</span>
                </div>

                {/* IGV: 18% del precio con descuentos */}
                <div className="flex justify-between text-brand-muted">
                  <span>IGV (18%)</span>
                  <span className="font-semibold">S/ {igv.toFixed(2)}</span>
                </div>

                <div className="border-t border-[#C8E6E8] pt-2.5 flex justify-between font-bold text-brand-dark">
                  <span>Total a pagar</span>
                  <span className="text-lg">S/ {precioConDescuentos.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Elemento visual: card de acciones principales */}
          <div className={`${cardCls} p-4 space-y-3`}>
            {/* Proceder a Compra Segura: pantalla de "próximamente" */}
            <button
              onClick={() => navigate('/compra-segura')}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary-hover text-white font-bold text-sm shadow-md hover:bg-[#004d56] transition-colors"
            >
              Proceder a compra segura 🔒
            </button>

            {/* Solicitar cotización: navega a SolicitudCotizacion ya conectada */}
            <button
              onClick={() => navigate('/quotes/new')}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white border border-primary2 text-primary2 font-bold text-sm hover:bg-primary2/5 transition-colors"
            >
              Solicitar cotización formal
            </button>

            <p className="text-[10px] text-brand-muted text-center pt-1">
              Tu transacción está protegida con cifrado de extremo a extremo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCart;
