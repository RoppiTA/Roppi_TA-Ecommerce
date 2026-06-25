// Elemento visual: Contexto global del carrito — no renderiza UI propia
// excepto el dot animado que vuela del botón "Añadir" al ícono del carrito en el Header

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Descuento } from '../types/producto/descuento.types';
import { LineaCarrito } from '../types/carrito/carrito.types';

const STORAGE_KEY = 'roppi_carrito';

// ─── Tipos del contexto ────────────────────────────────────────────────────────

interface FlyDot {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface CarritoContextType {
  items: LineaCarrito[];
  totalItems: number;
  // Agrega o incrementa una línea; aplica descuento si corresponde
  addItem: (item: Omit<LineaCarrito, 'numeroLinea' | 'descuentoAplicado'>) => void;
  // Actualiza cantidad de una línea; re-calcula descuento
  updateCantidad: (numeroLinea: number, cantidad: number) => void;
  removeItem: (numeroLinea: number) => void;
  clearCart: () => void;
  // Dispara la animación del dot desde el elemento origen hasta el ícono del carrito
  triggerAddAnimation: (sourceEl: HTMLElement) => void;
}

// ─── Contexto ─────────────────────────────────────────────────────────────────

const CarritoContext = createContext<CarritoContextType | null>(null);

export const useCarrito = (): CarritoContextType => {
  const ctx = useContext(CarritoContext);
  if (!ctx) {
    // Estos valores son para el comerciante, que no usa carrito.
    // El carrito siempre se carga al ser un header general.
    return {
      items: [],
      totalItems: 0,
      addItem: () => {},
      updateCantidad: () => {},
      removeItem: () => {},
      clearCart: () => {},
      triggerAddAnimation: () => {},
    };
  }
  return ctx;
};

// ─── Helper: aplica el mejor descuento vigente para un ítem ──────────────────

function calcularDescuento(
  productoId: number,
  precioUnitario: number,
  cantidad: number,
  descuentos: Descuento[]
): LineaCarrito['descuentoAplicado'] {
  // Entidad: Descuento — filtra los que aplican al producto y tienen cantidad mínima cubierta
  const aplicables = descuentos.filter(
    (d) => d.idGenericoVinculados.includes(productoId) && cantidad >= d.cantidad
  );
  if (!aplicables.length) return undefined;

  // Elige el descuento con mayor porcentaje si hay varios
  const mejor = aplicables.reduce((a, b) =>
    a.porcentajeDescuento >= b.porcentajeDescuento ? a : b
  );

  return {
    id: mejor.id,
    nombre: mejor.nombre,
    porcentajeDescuento: mejor.porcentajeDescuento,
    montoDescontado: +(precioUnitario * cantidad * mejor.porcentajeDescuento / 100).toFixed(2),
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CarritoProvider = ({ children }: { children: React.ReactNode }) => {
  // Entidad: LineaCarrito[] — lista de ítems del carrito, persistida en localStorage
  const [items, setItems] = useState<LineaCarrito[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Entidad: Descuento[] — catálogo de descuentos disponibles para aplicar al carrito
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);

  // Estado de la animación del dot volador
  const [flyDot, setFlyDot] = useState<FlyDot | null>(null);
  const [flyPhase, setFlyPhase] = useState<'start' | 'fly' | null>(null);

  const nextLineaRef = useRef(1);

  // Sincroniza localStorage al cambiar los ítems
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Inicializa el contador de líneas según lo que ya había en localStorage
  useEffect(() => {
    if (items.length > 0) {
      nextLineaRef.current = Math.max(...items.map((i) => i.numeroLinea)) + 1;
    }
  }, []);

  // TODO API: reemplazar este fetch manual por DescuentosAPIService.getDescuentos()
  // cuando el servicio esté disponible — GET /productos/descuentos
  useEffect(() => {
    const cargarDescuentos = async () => {
      try {
        const { DescuentosAPIService } = await import('../api/productos.api');
        const data = await DescuentosAPIService.getDescuentos();
        setDescuentos(data);
      } catch {
        // Si la API falla, el carrito opera sin descuentos
        setDescuentos([]);
      }
    };
    cargarDescuentos();
  }, []);

  const totalItems = items.length;

  // ── Agregar ítem ────────────────────────────────────────────────────────────

  const addItem = useCallback(
    (newItem: Omit<LineaCarrito, 'numeroLinea' | 'descuentoAplicado'>) => {
      setItems((prev) => {
        // Busca línea existente con mismo producto y mismos atributos
        const existingIdx = prev.findIndex(
          (i) =>
            i.productoId === newItem.productoId &&
            i.atributos.talla === newItem.atributos.talla &&
            i.atributos.material === newItem.atributos.material &&
            i.atributos.personalizacion === newItem.atributos.personalizacion &&
            i.atributos.color === newItem.atributos.color
        );

        let updated: LineaCarrito[];

        if (existingIdx >= 0) {
          // Acumula cantidad en la línea existente
          updated = prev.map((item, idx) => {
            if (idx !== existingIdx) return item;
            const nuevaCantidad = Math.min(item.cantidad + newItem.cantidad, item.maximoStock);
            return {
              ...item,
              cantidad: nuevaCantidad,
              descuentoAplicado: calcularDescuento(
                item.productoId,
                item.precioUnitario,
                nuevaCantidad,
                descuentos
              ),
            };
          });
        } else {
          // Crea nueva línea en la entidad Carrito
          const linea: LineaCarrito = {
            ...newItem,
            numeroLinea: nextLineaRef.current++,
            descuentoAplicado: calcularDescuento(
              newItem.productoId,
              newItem.precioUnitario,
              newItem.cantidad,
              descuentos
            ),
          };
          updated = [...prev, linea];
        }

        // TODO API: llamar a CarritoAPIService.guardarCarrito(updated)
        // para persistir la entidad Carrito en BD — POST /cotizaciones/carrito
        return updated;
      });
    },
    [descuentos]
  );

  // ── Actualizar cantidad ─────────────────────────────────────────────────────

  const updateCantidad = useCallback(
    (numeroLinea: number, cantidad: number) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.numeroLinea !== numeroLinea) return item;
          const cantidadValida = Math.max(1, Math.min(cantidad, item.maximoStock));
          const linea = {
            ...item,
            cantidad: cantidadValida,
            descuentoAplicado: calcularDescuento(
              item.productoId,
              item.precioUnitario,
              cantidadValida,
              descuentos
            ),
          };
          // TODO API: llamar a CarritoAPIService.actualizarLinea(numeroLinea, cantidadValida)
          // para actualizar la línea en BD — PUT /cotizaciones/carrito/linea/{numeroLinea}
          return linea;
        })
      );
    },
    [descuentos]
  );

  // ── Eliminar ítem ───────────────────────────────────────────────────────────

  const removeItem = useCallback((numeroLinea: number) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.numeroLinea !== numeroLinea);
      // TODO API: llamar a CarritoAPIService.eliminarLinea(numeroLinea)
      // para eliminar la línea en BD — DELETE /cotizaciones/carrito/linea/{numeroLinea}
      return updated;
    });
  }, []);

  // ── Vaciar carrito ──────────────────────────────────────────────────────────

  const clearCart = useCallback(() => {
    setItems([]);
    nextLineaRef.current = 1;
    localStorage.removeItem(STORAGE_KEY);
    // TODO API: llamar a CarritoAPIService.limpiarCarrito()
    // para vaciar la entidad Carrito en BD — DELETE /cotizaciones/carrito
  }, []);

  // ── Animación: dot volando desde el botón hasta el ícono del carrito ────────

  const triggerAddAnimation = useCallback((sourceEl: HTMLElement) => {
    const cartIcon = document.querySelector('[data-cart-icon]');
    if (!cartIcon) return;

    const src = sourceEl.getBoundingClientRect();
    const dst = cartIcon.getBoundingClientRect();

    setFlyDot({
      startX: src.left + src.width / 2,
      startY: src.top + src.height / 2,
      endX: dst.left + dst.width / 2,
      endY: dst.top + dst.height / 2,
    });
    setFlyPhase('start');

    // Doble RAF: primer frame renderiza el dot en posición inicial,
    // segundo frame aplica la transition para que se anime hacia el carrito
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlyPhase('fly');
      });
    });

    setTimeout(() => {
      setFlyPhase(null);
      setFlyDot(null);
    }, 650);
  }, []);

  return (
    <CarritoContext.Provider
      value={{ items, totalItems, addItem, updateCantidad, removeItem, clearCart, triggerAddAnimation }}
    >
      {children}

      {/* Elemento visual: dot animado que vuela del botón "Añadir" al ícono del carrito */}
      {flyDot && flyPhase && (
        <div
          aria-hidden
          className="fixed z-[9999] pointer-events-none w-5 h-5 bg-primary2 rounded-full shadow-lg"
          style={{
            left: flyPhase === 'fly' ? flyDot.endX : flyDot.startX,
            top: flyPhase === 'fly' ? flyDot.endY : flyDot.startY,
            transform: 'translate(-50%, -50%)',
            opacity: flyPhase === 'fly' ? 0 : 1,
            scale: flyPhase === 'fly' ? '0.4' : '1',
            transition:
              flyPhase === 'fly'
                ? 'left 0.55s cubic-bezier(0.2,0.8,0.3,1), top 0.55s cubic-bezier(0.2,0.8,0.3,1), opacity 0.3s 0.3s, scale 0.3s 0.3s'
                : 'none',
          }}
        />
      )}
    </CarritoContext.Provider>
  );
};
