import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Save, Edit, X, Upload, ImageMinus } from 'lucide-react';
import { ProductoGenerico, CreateProductGenericoDTO } from '../../types/producto/productoGen.types';
import assets from '../../assets/assets.js';
import { useProductosGenericos } from '../../hooks/useProductos';
import { MensajeModal } from '../../components/MensajeModal';

const blockNonDecimal = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
};
const blockNonInteger = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
};

const labelCls = 'block text-[10px] font-bold uppercase tracking-wide text-brand-muted mb-1';
const inputCls = 'w-full px-3 py-2 bg-brand-light/40 border border-primary2/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary2/40 text-brand-dark';
const sectionCls = 'pb-5 border-b border-primary-hover/10 last:border-0 last:pb-0';
const sectionTitleCls = 'text-xs font-bold uppercase tracking-wide text-brand-muted mb-3';

type ViewMode = 'view' | 'create' | 'edit';

export default function DetalleProducto() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const state = location.state as { productoId?: number } | null;
  const id_nav = state?.productoId;

  const [view, setView] = useState<ViewMode>(
    location.pathname.includes('/new') ? 'create' : 'view'
  );
  const isEditable = view === 'create' || view === 'edit';

  const {
    colores = [],
    materiales = [],
    tamano = [],
    personalizaciones = [],
    getProductoById,
    addProducto,
    updateProducto,
    deleteProducto,
    loading: loadingHook,
  } = useProductosGenericos();

  const [product, setProduct] = useState<ProductoGenerico | null>(null);
  const [editedProduct, setEditedProduct] = useState<ProductoGenerico | null>(null);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [mensajeModal, setMensajeModal] = useState<{
    tipo: 'cargando' | 'exito' | 'error' | 'confirmar';
    texto?: string;
    onCerrar?: () => void;
    onConfirmar?: () => void | Promise<void>;
  } | null>(null);

  const getMaterial        = (id: number) => materiales.find(m => m.id === id);
  const getColor           = (id: number) => colores.find(c => c.id === id);
  const getTamano          = (id: number) => tamano.find(s => s.id === id);
  const getPersonalizacion = (id: number) => personalizaciones.find(p => p.id === id);
  const getColorHex        = (id: number) => getColor(id)?.pantone ?? '#ccc';

  const renderImage = () => {
    if (isEditable && imagePreview) return imagePreview;
    const name = isEditable ? editedProduct?.imagen : product?.imagen;
    if (name) return assets[name as keyof typeof assets] || assets['maxwell'];
    return assets['maxwell'];
  };

  useEffect(() => {
    if (view === 'create') {
      setEditedProduct({ id: 0, nombre: '', activo: 1, precio_base: 0, maximo_stock: 0, descripcion: '', imagen: 'maxwell', materiales: [], colores: [], tamanos: [], personalizaciones: [] });
      setProduct(null);
      setImagePreview(null);
      return;
    }
    const fetchProduct = async () => {
      if (!id_nav) return;
      try {
        setLoadingLocal(true);
        const data = await getProductoById(Number(id_nav));
        setProduct(data);
        setEditedProduct(data);
        setImagePreview(null);
      } catch { console.error('No se pudo cargar el producto'); }
      finally { setLoadingLocal(false); }
    };
    fetchProduct();
  }, [view, id_nav, getProductoById]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editedProduct) return;
    setEditedProduct({ ...editedProduct, imagen: file.name });
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (!editedProduct) return;
    setEditedProduct({ ...editedProduct, imagen: '' });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!editedProduct) return;
    setMensajeModal({ tipo: 'cargando', texto: 'Guardando producto...' });
    try {
      const dto: CreateProductGenericoDTO = {
        nombre: editedProduct.nombre,
        descripcion: editedProduct.descripcion,
        precio_base: editedProduct.precio_base,
        activo: editedProduct.activo,
        maximo_stock: editedProduct.maximo_stock,
        imagen: editedProduct.imagen,
        colores: editedProduct.colores,
        materiales: editedProduct.materiales,
        tamanos: editedProduct.tamanos,
        personalizaciones: editedProduct.personalizaciones,
      };
      if (view === 'create') {
        await addProducto(dto);
        setMensajeModal({
          tipo: 'exito',
          texto: 'Producto creado exitosamente',
          onCerrar: () => navigate('/comerciante/products'),
        });
      } else if (view === 'edit' && id_nav) {
        const updated = await updateProducto(id_nav, dto);
        setProduct(updated);
        setEditedProduct(updated);
        setMensajeModal({
          tipo: 'exito',
          texto: 'Cambios guardados exitosamente',
          onCerrar: () => setView('view'),
        });
      }
    } catch {
      setMensajeModal({ tipo: 'error', texto: 'Error al guardar el producto.' });
    }
  };

  const handleCancel = () => {
    setEditedProduct(product);
    setImagePreview(null);
    if (view === 'create') navigate('/comerciante/products');
    else setView('view');
  };

  const handleDelete = () => {
    if (!id_nav) return;
    setMensajeModal({
      tipo: 'confirmar',
      texto: '¿Estás seguro de que quieres desactivar este producto?',
      onConfirmar: async () => {
        setMensajeModal({ tipo: 'cargando', texto: 'Desactivando producto...' });
        try {
          await deleteProducto(id_nav);
          setMensajeModal({
            tipo: 'exito',
            texto: 'Producto desactivado exitosamente',
            onCerrar: () => navigate('/comerciante/products'),
          });
        } catch {
          setMensajeModal({ tipo: 'error', texto: 'Error al desactivar el producto.' });
        }
      },
    });
  };

  const currentProduct = isEditable ? editedProduct : product;

  const getAvailableMaterials    = () => materiales.filter(m => !currentProduct?.materiales.find(em => em.id === m.id));
  const getAvailableColors       = () => colores.filter(c => !currentProduct?.colores.find(ec => ec.id === c.id));
  const getAvailableSizes        = () => tamano.filter(s => !currentProduct?.tamanos.find(es => es.id === s.id));
  const getAvailableCustomizations = () => personalizaciones.filter(c => !currentProduct?.personalizaciones.find(ec => ec.id === c.id));

  if (loadingHook || loadingLocal) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-lg font-medium text-brand-muted">Cargando producto...</p>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center max-w-md">
          <p className="text-red-700 font-medium">Producto no encontrado o sesión expirada (F5).</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="p-6 max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/comerciante/products')}
              className="flex items-center gap-1.5 text-primary2 hover:text-primary-hover text-sm font-medium transition-colors mb-2"
            >
              <ArrowLeft size={16} />
              Volver a productos
            </button>
            <h1 className="text-xl font-semibold text-brand-dark">
              {view === 'create' ? 'Nuevo Producto' : currentProduct.nombre}
            </h1>
          </div>

          <div className="flex gap-2 pt-1">
            {view === 'view' && (
              <>
                <button
                  onClick={() => setView('edit')}
                  className="px-4 py-2 border border-primary-hover text-primary-hover rounded-lg hover:bg-brand-light flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <Edit size={15} />
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-brand-error text-brand-error rounded-lg hover:bg-brand-error/5 flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <Trash2 size={15} />
                  Desactivar
                </button>
              </>
            )}
            {isEditable && (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary-hover text-white rounded-lg hover:bg-primary2 flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <Save size={15} />
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-brand-muted text-brand-muted rounded-lg hover:bg-brand-light flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <X size={15} />
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Tarjeta principal ── */}
        <div className="bg-white rounded-lg border border-primary-hover/20 overflow-hidden">
          <div className="grid grid-cols-[280px_1fr]">

            {/* ── Columna imagen ── */}
            <div className="border-r border-primary-hover/15 p-5 flex flex-col gap-4">
              {/* Imagen con overlay de edición */}
              <div className="relative group rounded-lg overflow-hidden border border-primary-hover/15">
                <img
                  src={renderImage()}
                  alt={currentProduct.nombre || 'Producto'}
                  className="w-full aspect-[3/4] object-cover"
                />
                {isEditable && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="px-3 py-1.5 bg-white/90 hover:bg-white text-brand-dark rounded-lg flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors">
                      <Upload size={13} />
                      {currentProduct.imagen ? 'Cambiar imagen' : 'Subir imagen'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                      />
                    </label>
                    {currentProduct.imagen && (
                      <button
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 bg-brand-error/90 hover:bg-brand-error text-white rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors"
                      >
                        <ImageMinus size={13} />
                        Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isEditable && (
                <p className="text-[10px] text-brand-muted text-center break-all">
                  Archivo: <span className="font-mono font-semibold">{currentProduct.imagen || '(ninguno)'}</span>
                </p>
              )}

              {/* Estado */}
              <div className="flex items-center justify-between px-1">
                <span className={labelCls}>Estado</span>
                {isEditable ? (
                  <button
                    type="button"
                    onClick={() => setEditedProduct({ ...currentProduct, activo: currentProduct.activo === 1 ? 0 : 1 })}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${currentProduct.activo === 1 ? 'bg-primary2/15 text-primary-hover' : 'bg-brand-muted/15 text-brand-muted'}`}
                  >
                    {currentProduct.activo === 1 ? 'ACTIVO' : 'INACTIVO'}
                  </button>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${currentProduct.activo === 1 ? 'bg-primary2/15 text-primary-hover' : 'bg-brand-muted/15 text-brand-muted'}`}>
                    {currentProduct.activo === 1 ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                )}
              </div>
            </div>

            {/* ── Columna atributos ── */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-200px)]">

              {/* Información general */}
              <div className={sectionCls}>
                <p className={sectionTitleCls}>Información general</p>
                <div className="space-y-3">

                  {/* Nombre */}
                  <div>
                    <label className={labelCls}>Nombre del producto</label>
                    {isEditable ? (
                      <input
                        type="text"
                        value={currentProduct.nombre}
                        onChange={e => setEditedProduct({ ...currentProduct, nombre: e.target.value })}
                        className={inputCls}
                        placeholder="Nombre del producto"
                      />
                    ) : (
                      <p className="text-base font-semibold text-brand-dark">{currentProduct.nombre}</p>
                    )}
                  </div>

                  {/* Precio y Stock */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Precio base</label>
                      {isEditable ? (
                        <div className={`flex items-center bg-brand-light/40 border border-primary2/30 rounded overflow-hidden`}>
                          <span className="px-2 py-2 bg-brand-light text-[10px] font-bold text-primary-hover border-r border-primary2/20 whitespace-nowrap">S/.</span>
                          <input
                            type="number"
                            step="0.01"
                            value={currentProduct.precio_base}
                            onKeyDown={blockNonDecimal}
                            onChange={e => { const v = Number(e.target.value); if (v >= 0) setEditedProduct({ ...currentProduct, precio_base: v }); }}
                            className="flex-1 px-2 py-2 text-sm focus:outline-none bg-transparent text-brand-dark min-w-0"
                          />
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-brand-dark">S/ {currentProduct.precio_base.toFixed(2)}</p>
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>Stock máximo</label>
                      {isEditable ? (
                        <div className="flex items-center bg-brand-light/40 border border-primary2/30 rounded overflow-hidden">
                          <input
                            type="number"
                            value={currentProduct.maximo_stock}
                            onKeyDown={blockNonInteger}
                            onChange={e => { const v = Number(e.target.value); if (v >= 0) setEditedProduct({ ...currentProduct, maximo_stock: v }); }}
                            className="flex-1 px-2 py-2 text-sm focus:outline-none bg-transparent text-brand-dark min-w-0"
                          />
                          <span className="px-2 py-2 bg-brand-light text-[10px] font-bold text-primary-hover border-l border-primary2/20 whitespace-nowrap">UNID.</span>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-brand-dark">{currentProduct.maximo_stock} unidades</p>
                      )}
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className={labelCls}>Descripción</label>
                    {isEditable ? (
                      <textarea
                        value={currentProduct.descripcion}
                        onChange={e => setEditedProduct({ ...currentProduct, descripcion: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-brand-light/40 border border-primary2/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary2/40 text-brand-dark resize-none"
                        placeholder="Descripción del producto..."
                      />
                    ) : (
                      <p className="text-sm text-brand-muted leading-relaxed">{currentProduct.descripcion || '—'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Materiales */}
              <div className={sectionCls}>
                <p className={sectionTitleCls}>Materiales</p>
                <div className="space-y-1.5">
                  {currentProduct.materiales.map((mat, index) => {
                    const info = getMaterial(mat.id);
                    return (
                      <div key={mat.id} className="flex items-center bg-brand-light/40 border border-primary2/25 rounded px-3 py-2 gap-3 text-sm">
                        <span className="flex-1 font-medium text-brand-dark truncate">{info?.nombre ?? `Material #${mat.id}`}</span>
                        {isEditable ? (
                          <>
                            <span className="text-[10px] text-brand-muted shrink-0">+S/.</span>
                            <input
                              type="number" step="0.01"
                              value={mat.costoExtra}
                              onKeyDown={blockNonDecimal}
                              onChange={e => {
                                const updated = [...currentProduct.materiales];
                                updated[index] = { ...updated[index], costoExtra: Number(e.target.value) };
                                setEditedProduct({ ...currentProduct, materiales: updated });
                              }}
                              className="w-14 text-sm border-b border-primary2/30 focus:outline-none bg-transparent text-brand-dark"
                            />
                            <button type="button" onClick={() => setEditedProduct({ ...currentProduct, materiales: currentProduct.materiales.filter(m => m.id !== mat.id) })} className="text-brand-muted hover:text-brand-error transition-colors shrink-0">
                              <Trash2 size={13} />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-brand-muted shrink-0">+S/. {mat.costoExtra}</span>
                        )}
                      </div>
                    );
                  })}
                  {isEditable && getAvailableMaterials().length > 0 && (
                    <select value="" onChange={e => { const m = materiales.find(m => m.id === Number(e.target.value)); if (m && !currentProduct.materiales.find(em => em.id === m.id)) setEditedProduct({ ...currentProduct, materiales: [...currentProduct.materiales, { id: m.id, costoExtra: 0 }] }); }} className="w-full px-2 py-1.5 border border-primary2/30 rounded text-xs focus:outline-none bg-white text-brand-dark">
                      <option value="">+ Agregar material...</option>
                      {getAvailableMaterials().map(m => <option key={m.id} value={m.id}>{m.nombre}{m.descripcion ? ` — ${m.descripcion}` : ''}</option>)}
                    </select>
                  )}
                  {currentProduct.materiales.length === 0 && !isEditable && <p className="text-xs text-brand-muted">Sin materiales asignados</p>}
                </div>
              </div>

              {/* Colores */}
              <div className={sectionCls}>
                <p className={sectionTitleCls}>Colores</p>
                <div className="flex flex-wrap gap-2">
                  {currentProduct.colores.map(col => {
                    const info = getColor(col.id);
                    return (
                      <div key={col.id} className="flex items-center gap-1.5 bg-brand-light/40 border border-primary2/25 rounded-full px-2.5 py-1">
                        <div className="w-3.5 h-3.5 rounded-full border border-primary2/30 shrink-0" style={{ backgroundColor: getColorHex(col.id) }} />
                        <span className="text-xs font-medium text-brand-dark">{info?.nombre ?? `#${col.id}`}</span>
                        {isEditable && (
                          <button type="button" onClick={() => setEditedProduct({ ...currentProduct, colores: currentProduct.colores.filter(c => c.id !== col.id) })} className="text-brand-muted hover:text-brand-error transition-colors ml-0.5">
                            <X size={11} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {isEditable && getAvailableColors().length > 0 && (
                    <select value="" onChange={e => { const c = colores.find(c => c.id === Number(e.target.value)); if (c && !currentProduct.colores.find(ec => ec.id === c.id)) setEditedProduct({ ...currentProduct, colores: [...currentProduct.colores, { id: c.id }] }); }} className="px-2 py-1 border border-primary2/30 rounded-full text-xs focus:outline-none bg-white text-brand-dark">
                      <option value="">+ Color...</option>
                      {getAvailableColors().map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  )}
                  {currentProduct.colores.length === 0 && !isEditable && <p className="text-xs text-brand-muted">Sin colores asignados</p>}
                </div>
              </div>

              {/* Tamaños */}
              <div className={sectionCls}>
                <p className={sectionTitleCls}>Tamaños</p>
                <div className="space-y-1.5">
                  {currentProduct.tamanos.map((tam, index) => {
                    const info = getTamano(tam.id);
                    return (
                      <div key={tam.id} className="flex items-center bg-brand-light/40 border border-primary2/25 rounded px-3 py-2 gap-3">
                        <span className="text-xs font-bold text-brand-dark shrink-0 w-8">{info?.nombre ?? `#${tam.id}`}</span>
                        {isEditable ? (
                          <>
                            <span className="text-[10px] text-brand-muted uppercase shrink-0">Ancho:</span>
                            <input type="number" value={tam.ancho} onKeyDown={blockNonDecimal} onChange={e => { const updated = [...currentProduct.tamanos]; updated[index] = { ...updated[index], ancho: Number(e.target.value) }; setEditedProduct({ ...currentProduct, tamanos: updated }); }} className="w-12 text-xs border-b border-primary2/30 focus:outline-none bg-transparent text-brand-dark" />
                            <span className="text-[10px] text-brand-muted uppercase shrink-0">Alto:</span>
                            <input type="number" value={tam.alto} onKeyDown={blockNonDecimal} onChange={e => { const updated = [...currentProduct.tamanos]; updated[index] = { ...updated[index], alto: Number(e.target.value) }; setEditedProduct({ ...currentProduct, tamanos: updated }); }} className="w-12 text-xs border-b border-primary2/30 focus:outline-none bg-transparent text-brand-dark" />
                            <span className="text-[10px] text-brand-muted shrink-0">cm</span>
                            <button type="button" onClick={() => setEditedProduct({ ...currentProduct, tamanos: currentProduct.tamanos.filter(s => s.id !== tam.id) })} className="ml-auto text-brand-muted hover:text-brand-error transition-colors shrink-0"><Trash2 size={13} /></button>
                          </>
                        ) : (
                          <span className="text-xs text-brand-muted">{tam.ancho} × {tam.alto} cm</span>
                        )}
                      </div>
                    );
                  })}
                  {isEditable && getAvailableSizes().length > 0 && (
                    <select value="" onChange={e => { const s = tamano.find(s => s.id === Number(e.target.value)); if (s && !currentProduct.tamanos.find(es => es.id === s.id)) setEditedProduct({ ...currentProduct, tamanos: [...currentProduct.tamanos, { id: s.id, ancho: 0, alto: 0 }] }); }} className="w-full px-2 py-1.5 border border-primary2/30 rounded text-xs focus:outline-none bg-white text-brand-dark">
                      <option value="">+ Agregar tamaño...</option>
                      {getAvailableSizes().map(s => <option key={s.id} value={s.id}>{s.nombre}{s.descripcion ? ` — ${s.descripcion}` : ''}</option>)}
                    </select>
                  )}
                  {currentProduct.tamanos.length === 0 && !isEditable && <p className="text-xs text-brand-muted">Sin tamaños asignados</p>}
                </div>
              </div>

              {/* Personalizaciones */}
              <div className={sectionCls}>
                <p className={sectionTitleCls}>Personalizaciones</p>
                <div className="space-y-1.5">
                  {currentProduct.personalizaciones.map((per, index) => {
                    const info = getPersonalizacion(per.id);
                    return (
                      <div key={per.id} className="flex items-center bg-brand-light/40 border border-primary2/25 rounded px-3 py-2 gap-3 text-sm">
                        <span className="flex-1 font-medium text-brand-dark truncate">{info?.nombre ?? `Personalización #${per.id}`}</span>
                        {isEditable ? (
                          <>
                            <span className="text-[10px] text-brand-muted shrink-0">+S/.</span>
                            <input
                              type="number" step="0.01"
                              value={per.costoExtra}
                              onKeyDown={blockNonDecimal}
                              onChange={e => {
                                const updated = [...currentProduct.personalizaciones];
                                updated[index] = { ...updated[index], costoExtra: Number(e.target.value) };
                                setEditedProduct({ ...currentProduct, personalizaciones: updated });
                              }}
                              className="w-14 text-sm border-b border-primary2/30 focus:outline-none bg-transparent text-brand-dark"
                            />
                            <button type="button" onClick={() => setEditedProduct({ ...currentProduct, personalizaciones: currentProduct.personalizaciones.filter(p => p.id !== per.id) })} className="text-brand-muted hover:text-brand-error transition-colors shrink-0">
                              <Trash2 size={13} />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-brand-muted shrink-0">+S/. {per.costoExtra}</span>
                        )}
                      </div>
                    );
                  })}
                  {isEditable && getAvailableCustomizations().length > 0 && (
                    <select value="" onChange={e => { const p = personalizaciones.find(p => p.id === Number(e.target.value)); if (p && !currentProduct.personalizaciones.find(ec => ec.id === p.id)) setEditedProduct({ ...currentProduct, personalizaciones: [...currentProduct.personalizaciones, { id: p.id, costoExtra: 0 }] }); }} className="w-full px-2 py-1.5 border border-primary2/30 rounded text-xs focus:outline-none bg-white text-brand-dark">
                      <option value="">+ Agregar personalización...</option>
                      {getAvailableCustomizations().map(p => <option key={p.id} value={p.id}>{p.nombre}{p.descripcion ? ` — ${p.descripcion}` : ''}</option>)}
                    </select>
                  )}
                  {currentProduct.personalizaciones.length === 0 && !isEditable && <p className="text-xs text-brand-muted">Sin personalizaciones asignadas</p>}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {mensajeModal && (
        <MensajeModal
          tipo={mensajeModal.tipo}
          mensaje={mensajeModal.texto}
          onClose={() => {
            const cb = mensajeModal.onCerrar;
            setMensajeModal(null);
            cb?.();
          }}
          onConfirm={mensajeModal.onConfirmar}
        />
      )}
    </div>
  );
}
