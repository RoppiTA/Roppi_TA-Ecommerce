import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { ProductoGenerico } from '../../types/producto/productoGen.types';
import assets from '../../assets/assets.js';
import { useProductosGenericos } from '../../hooks/useProductos';

const labelCls = 'block text-[10px] font-bold uppercase tracking-wide text-brand-muted mb-1';
const sectionCls = 'pb-5 border-b border-primary-hover/10 last:border-0 last:pb-0';
const sectionTitleCls = 'text-xs font-bold uppercase tracking-wide text-brand-muted mb-3';

export default function DetalleProducto() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extraemos el ID desde el estado de la navegación
  const state = location.state as { productoId?: number } | null;
  const id_nav = state?.productoId;

  const {
    colores = [],
    materiales = [],
    tamano = [],
    personalizaciones = [],
    getProductoById,
    loading: loadingHook,
  } = useProductosGenericos();

  const [product, setProduct] = useState<ProductoGenerico | null>(null);
  const [loadingLocal, setLoadingLocal] = useState(false);

  // Helpers de búsqueda en catálogos maestro
  const getMaterial        = (id: number) => materiales.find(m => m.id === id);
  const getColor           = (id: number) => colores.find(c => c.id === id);
  const getTamano          = (id: number) => tamano.find(s => s.id === id);
  const getPersonalizacion = (id: number) => personalizaciones.find(p => p.id === id);
  const getColorHex        = (id: number) => getColor(id)?.pantone ?? '#ccc';

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id_nav) return;
      try {
        setLoadingLocal(true);
        const data = await getProductoById(Number(id_nav));
        setProduct(data);
      } catch (error) {
        console.error('No se pudo cargar el producto', error);
      } finally {
        setLoadingLocal(false);
      }
    };
    fetchProduct();
  }, [id_nav, getProductoById]);

  // Manejo de la acción futura para el carrito de compras
  const handleAddToCart = () => {
    navigate('/personalization', { state: { productoId: product?.id} });
  }
  

  if (loadingHook || loadingLocal) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-lg font-medium text-brand-muted">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center max-w-md">
          <p className="text-red-700 font-medium">Producto no encontrado o sesión expirada (F5).</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-3 text-sm text-primary2 font-semibold hover:underline block mx-auto"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50/50">
      <div className="p-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-80px)]">

        {/* ── Header ── */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-1.5 text-primary2 hover:text-primary-hover text-sm font-medium transition-colors mb-2"
          >
            <ArrowLeft size={16} />
            Volver a productos
          </button>
          <h1 className="text-xl font-semibold text-brand-dark">
            {product.nombre}
          </h1>
        </div>

        {/* ── Tarjeta Principal del Producto ── */}
        <div className="bg-white rounded-lg border border-primary-hover/20 overflow-hidden shadow-sm">
          <div className="grid grid-cols-[320px_1fr]">

            {/* ── Columna de Imagen fija ── */}
            <div className="border-r border-primary-hover/15 p-5 flex flex-col gap-4 bg-gray-50/30">
              <div className="rounded-lg overflow-hidden border border-primary-hover/15 bg-white">
                <img
                  src={assets[product.imagen as keyof typeof assets] || assets['maxwell']}
                  alt={product.nombre}
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>

              {/* Tag de Disponibilidad */}
              <div className="flex items-center justify-between px-1 mt-2">
                <span className={labelCls}>Disponibilidad</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.activo === 1 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-brand-muted/15 text-brand-muted'}`}>
                  {product.activo === 1 ? 'Disponible' : 'No Disponible'}
                </span>
              </div>
            </div>

            {/* ── Columna de Atributos y Acción ── */}
            <div className="p-6 flex flex-col justify-between max-h-[calc(100vh-220px)]">
              
              {/* Contenedor con Scroll para los Atributos Técnicos */}
              <div className="space-y-5 overflow-y-auto pr-2 flex-1">

                {/* Información General */}
                <div className={sectionCls}>
                  <p className={sectionTitleCls}>Detalles del artículo</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Precio Base</label>
                        <p className="text-lg font-bold text-primary-hover">S/ {product.precio_base.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className={labelCls}>Capacidad de producción total</label>
                        <p className="text-sm font-medium text-brand-dark">{product.maximo_stock} unidades disponibles</p>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Descripción</label>
                      <p className="text-sm text-brand-muted leading-relaxed">{product.descripcion || 'Sin descripción proporcionada.'}</p>
                    </div>
                  </div>
                </div>

                {/* Materiales Asignados */}
                <div className={sectionCls}>
                  <p className={sectionTitleCls}>Materiales Disponibles</p>
                  <div className="space-y-1.5">
                    {product.materiales.map((mat) => {
                      const info = getMaterial(mat.id);
                      return (
                        <div key={mat.id} className="flex items-center bg-brand-light/40 border border-primary2/15 rounded px-3 py-2 gap-3 text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-brand-dark truncate">{info?.nombre ?? `Material #${mat.id}`}</p>
                            {info?.descripcion && <p className="text-[11px] text-brand-muted truncate">{info.descripcion}</p>}
                          </div>
                          <span className="text-xs font-semibold text-brand-muted shrink-0">
                            {mat.costo_extra > 0 ? `+S/. ${mat.costo_extra.toFixed(2)}` : 'Precio base'}
                          </span>
                        </div>
                      );
                    })}
                    {product.materiales.length === 0 && <p className="text-xs text-brand-muted italic">Estándar del fabricante</p>}
                  </div>
                </div>

                {/* Colores */}
                <div className={sectionCls}>
                  <p className={sectionTitleCls}>Variantes de Color</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colores.map(col => {
                      const info = getColor(col.id);
                      return (
                        <div key={col.id} className="flex items-center gap-2 bg-brand-light/40 border border-primary2/15 rounded-full px-3 py-1">
                          <div className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: getColorHex(col.id) }} />
                          <span className="text-xs font-medium text-brand-dark">{info?.nombre ?? `#${col.id}`}</span>
                        </div>
                      );
                    })}
                    {product.colores.length === 0 && <p className="text-xs text-brand-muted italic">Color único</p>}
                  </div>
                </div>

                {/* Tamaños / Dimensiones */}
                <div className={sectionCls}>
                  <p className={sectionTitleCls}>Dimensiones Disponibles</p>
                  <div className="space-y-1.5">
                    {product.tamanos.map((tam) => {
                      const info = getTamano(tam.id);
                      return (
                        <div key={tam.id} className="flex items-center bg-brand-light/40 border border-primary2/15 rounded px-3 py-2 gap-3">
                          <div className="flex-1">
                            <span className="text-xs font-bold text-brand-dark">{info?.nombre ?? `Talla #${tam.id}`}</span>
                            {info?.descripcion && <p className="text-[11px] text-brand-muted">{info.descripcion}</p>}
                          </div>
                          <span className="text-xs font-medium text-brand-muted bg-white border border-primary2/10 px-2 py-0.5 rounded">
                            {tam.ancho} × {tam.alto} cm
                          </span>
                        </div>
                      );
                    })}
                    {product.tamanos.length === 0 && <p className="text-xs text-brand-muted italic">Medidas estándar</p>}
                  </div>
                </div>

                {/* Personalizaciones Admitidas */}
                <div className={sectionCls}>
                  <p className={sectionTitleCls}>Opciones de Personalización</p>
                  <div className="space-y-1.5">
                    {product.personalizaciones.map((per) => {
                      const info = getPersonalizacion(per.id);
                      return (
                        <div key={per.id} className="flex items-center bg-brand-light/40 border border-primary2/15 rounded px-3 py-2 gap-3 text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-brand-dark truncate">{info?.nombre ?? `Personalización #${per.id}`}</p>
                            {info?.descripcion && <p className="text-[11px] text-brand-muted truncate">{info.descripcion}</p>}
                          </div>
                          <span className="text-xs font-semibold text-brand-muted shrink-0">
                            {per.costo_extra > 0 ? `+S/. ${per.costo_extra.toFixed(2)}` : 'Sin recargo'}
                          </span>
                        </div>
                      );
                    })}
                    {product.personalizaciones.length === 0 && <p className="text-xs text-brand-muted italic">Este producto no admite modificaciones adicionales</p>}
                  </div>
                </div>
              </div>

              {/* ── Botón de Acción Exclusivo para el Cliente ── */}
              <div className="pt-4 border-t border-primary-hover/10 mt-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.activo !== 1}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-sm cursor-pointer
                    ${product.activo === 1 
                      ? 'bg-primary2 text-white hover:bg-primary-hover hover:shadow-primary2/20' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <ShoppingCart size={18} />
                  {product.activo === 1 ? 'Personalizar y Comprar' : 'Producto No Disponible'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}