// [feat] Vista de descuentos rediseñada con design system Tailwind — 2025-06
// Reemplaza el uso de MUI (DiscountTable + DiscountModal) por componentes Tailwind propios
// y reutiliza DiscountForm (extendido) como modal de creación/edición.
import { useEffect, useState } from 'react';
import { Filter, Pencil, Percent, Trash2 } from 'lucide-react';
import { useProductosGenericos, useDescuentos } from '../../hooks/useProductos';
import { Descuento } from '../../types/producto/descuento.types';
import { DiscountForm } from './DiscountForm';
import { MensajeModal } from '../../components/MensajeModal';
import { DiscountFilterModal } from './DiscountFilterModal';

export function DiscountsPage() {
  const { productos } = useProductosGenericos();
  const { descuentos, loading, fetchDescuentos, addDescuento, updateDescuento, deleteDescuento, getDescuentosPorIdProducto } = useDescuentos();

  // [feat] Estado del modal: null = cerrado, undefined = nuevo, Descuento = edición — 2025-06
  const [editingDiscount, setEditingDiscount] = useState<Descuento | undefined | null>(null);

  const [mensajeModal, setMensajeModal] = useState<{ texto?: string; tipo: 'exito' | 'error' | 'cargando' } | null>(null);

  const isModalOpen = editingDiscount !== null;

  const handleAdd = () => setEditingDiscount(undefined);
  const handleFilter = () => {
    setFilterModalOpen(true);
  };
  const handleEdit = (d: Descuento) => setEditingDiscount(d);
  const handleClose = () => setEditingDiscount(null);

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedProductFilter, setSelectedProductFilter] = useState<number | null>(null);
  const [descuentosMostrados, setDescuentosMostrados] = useState<Descuento[]>([]);

  useEffect(() => {
    if (selectedProductFilter === null) {
      setDescuentosMostrados(descuentos ?? []);
    }
  }, [descuentos, selectedProductFilter]);

  const handleSelectProductFilter = async (
    productId: number
  ) => {
    try {
      const descuentosFiltrados = await getDescuentosPorIdProducto(productId);
      setSelectedProductFilter(productId);
      setDescuentosMostrados(descuentosFiltrados ?? []);
      setFilterModalOpen(false);
    } catch {
      setMensajeModal({
        texto: 'Error al obtener descuentos del producto',
        tipo: 'error'
      });
    }
  };

  const clearFilter = async () => {
    setSelectedProductFilter(null);
     const todosLosDescuentos = await fetchDescuentos();
    setDescuentosMostrados(descuentos);
  };

  const handleSave = async (data: Omit<Descuento, 'id'>) => {
    handleClose();
    setMensajeModal({ tipo: 'cargando', texto: 'Guardando descuento...' });
    try {
      if (editingDiscount?.id) {
        await updateDescuento(editingDiscount.id, data);
      } else {
        await addDescuento(data);
      }
      setMensajeModal({ texto: 'Descuento registrado exitosamente', tipo: 'exito' });
    } catch {
      setMensajeModal({ texto: 'Error al registrar descuento', tipo: 'error' });
    }
  };

  const getProductNames = (ids?: number[]) =>
    ids && ids.length > 0
      ? ids
        .map((id) => productos.find((p) => p.id === id)?.nombre)
        .filter(Boolean)
        .join(', ') || '—'
      : '—';

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-lg font-medium text-brand-muted">Cargando descuentos...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* ── Encabezado ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-brand-dark mb-2">
          Gestión de Descuentos
        </h1>
        <p className="text-brand-muted text-sm mb-4">
          Administra las reglas de descuento y promociones aplicadas a tu catálogo de productos.
        </p>
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="px-2 py-1.5 bg-primary2/15 text-primary-hover font-semibold rounded text-xs">
            {`${descuentosMostrados.length} descuentos`}
          </span>

          {selectedProductFilter && (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary-hover/10 rounded-lg">
              <span className="text-sm text-primary-hover">
                Filtrado por:
                {
                  productos.find(
                    p => p.id === selectedProductFilter
                  )?.nombre
                }
              </span>

              <button
                onClick={clearFilter}
                className="text-brand-error text-xs font-semibold"
              >
                Quitar filtro
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-primary-hover text-white rounded-lg hover:bg-primary2 flex items-center gap-2 text-sm transition-colors"
          >
            <Filter size={16} />
            Filtrar Descuentos
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary-hover text-white rounded-lg hover:bg-primary2 flex items-center gap-2 text-sm transition-colors"
          >
            <Percent size={16} />
            Agregar Descuento
          </button>
        </div>
      </div>

      {/* ── Tabla de descuentos ── */}
      <div className="bg-white rounded-lg border border-primary-hover/20 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-primary-hover/15 bg-brand-light/40">
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-brand-muted">Nombre</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-brand-muted">Descuento</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-brand-muted">Cantidad mín.</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-brand-muted">Productos</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-brand-muted text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {descuentosMostrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-brand-muted">
                  No hay descuentos registrados. Agrega uno con el botón de arriba.
                </td>
              </tr>
            ) : (
              descuentosMostrados.map((d) => (
                <tr key={d.id} className="border-b border-primary-hover/10 hover:bg-brand-light/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-brand-dark">{d.nombre}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-primary2/15 text-primary-hover font-bold rounded text-xs">
                      {d.porcentajeDescuento}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-muted">{d.cantidad}</td>
                  <td className="px-4 py-3 text-xs text-brand-muted max-w-xs truncate">
                    {getProductNames(d.idGenericoVinculados)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(d)}
                        className="p-1.5 rounded hover:bg-primary2/10 text-primary2 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => deleteDescuento(d.id)} // FALTA: Mensaje de confirmación antes de eliminar
                        className="p-1.5 rounded hover:bg-brand-error/10 text-brand-error transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal de creación / edición ── */}
      {/* [feat] Reutiliza DiscountForm con initialData para edición y onClose para cerrar — 2025-06 */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <DiscountForm
              products={productos}
              discounts={descuentos}
              onSave={handleSave}
              onClose={handleClose}
              initialData={editingDiscount ?? undefined}
            />
          </div>
        </div>
      )}

      {mensajeModal && (
        <MensajeModal
          tipo={mensajeModal.tipo}
          mensaje={mensajeModal.texto}
          onClose={() => setMensajeModal(null)}
        />
      )}
      {filterModalOpen && (
          <DiscountFilterModal
            products={productos}
            onClose={() => setFilterModalOpen(false)}
            onSelect={handleSelectProductFilter}
          />
      )}
    </div>
    
  );
}


export default DiscountsPage;
