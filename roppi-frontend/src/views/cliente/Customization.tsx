import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Palette,
  RotateCw,
  ZoomIn,
  Scan,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react';
import { ProductoGenerico } from '../../types/producto/productoGen.types';
import assets from '../../assets/assets.js';
import { useProductosGenericos } from '../../hooks/useProductos';
import { PersonalizadorCanvas } from '../../components/PersonalizadorCanvas.js';

const sectionTitleCls = 'text-sm font-semibold text-brand-dark mb-3';

type DesignMode = 'upload' | 'preset';

export const Customization = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [colorSeleccionado, setColorSeleccionado] = useState<string>('#ffffff');
  const [imagenEstampado, setImagenEstampado] = useState<string | null>(null);
  const [estampadoRotacion, setEstampadoRotacion] = useState<number>(0);
  const [estampadoEscala, setEstampadoEscala] = useState<number>(1);
  const [showSlider, setShowSlider] = useState<boolean>(false);

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
  const getMaterial = (id: number) => materiales.find(m => m.id === id);
  const getColor = (id: number) => colores.find(c => c.id === id);
  const getTamanoInfo = (id: number) => tamano.find(s => s.id === id);
  const getPersonalizacion = (id: number) => personalizaciones.find(p => p.id === id);
  const getColorHex = (id: number) => getColor(id)?.pantone ?? '#ccc';

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id_nav) return;
      try {
        setLoadingLocal(true);
        const data = await getProductoById(Number(id_nav));
        setProduct(data);
        if (data && data.colores.length > 0) {
          setColorSeleccionado(getColorHex(data.colores[0].id));
        }
      } catch (error) {
        console.error('No se pudo cargar el producto', error);
      } finally {
        setLoadingLocal(false);
      }
    };
    fetchProduct();
  }, [id_nav, getProductoById]);

  // Selecciones del usuario
  const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null);
  const [selectedPersonalizacion, setSelectedPersonalizacion] = useState<number | null>(null);
  const [designMode, setDesignMode] = useState<DesignMode>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedTamano, setSelectedTamano] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicializa las selecciones por defecto apenas llega el producto
  useEffect(() => {
    if (!product) return;
    setSelectedMaterial(product.materiales[0]?.id ?? null);
    setSelectedPersonalizacion(product.personalizaciones[0]?.id ?? null);
    setSelectedColor(product.colores[0]?.id ?? null);
    setSelectedTamano(product.tamanos[0]?.id ?? null);
  }, [product]);

  const materialExtra = useMemo(() => {
    if (!product || selectedMaterial == null) return 0;
    return Number(product.materiales.find(m => m.id === selectedMaterial)?.costoExtra ?? 0);
  }, [product, selectedMaterial]);

  const personalizacionExtra = useMemo(() => {
    if (!product || selectedPersonalizacion == null) return 0;
    return Number(product.personalizaciones.find(p => p.id === selectedPersonalizacion)?.costoExtra ?? 0);
  }, [product, selectedPersonalizacion]);

  const precioUnitario = (product?.precio_base ?? 0) + materialExtra + personalizacionExtra;
  const precioTotal = precioUnitario * cantidad;
  const dimensionSeleccionada = product?.tamanos.find(t => t.id === selectedTamano);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setUploadedFile(file);
    
    if (file) {
      setDesignMode('upload');
      // Genera una URL temporal local para que use-image de Konva la pueda cargar
      const objectUrl = URL.createObjectURL(file);
      setImagenEstampado(objectUrl);
    } else {
      setImagenEstampado(null);
    }
  };

  const handleUploadClick = () => {
    setDesignMode('upload');
    fileInputRef.current?.click();
  };

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw === '') {
      setCantidad(0);
      return;
    }
    const max = product?.maximo_stock ?? Number.MAX_SAFE_INTEGER;
    setCantidad(Math.min(Number(raw), max));
  };

  const handleCantidadBlur = () => {
    const max = product?.maximo_stock ?? Number.MAX_SAFE_INTEGER;
    setCantidad(c => Math.min(Math.max(c, 1), max));
  };

  const handleAddToCart = () => {
    navigate('/cart', {
      state: {
        item: {
          productoId: product?.id,
          nombre: product?.nombre,
          materialId: selectedMaterial,
          personalizacionId: selectedPersonalizacion,
          colorId: selectedColor,
          tamanoId: selectedTamano,
          designMode,
          uploadedFileName: uploadedFile?.name,
          cantidad,
          precioUnitario,
        },
      },
    });
  };

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
    <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden bg-gray-50/50">
      <div className="p-6 max-w-6xl mx-auto flex flex-col lg:h-[calc(100vh-80px)]">

        {/* ── Cabecera fija: breadcrumb + volver + título + precio ── */}
        <div className="shrink-0 sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm pt-2 -mt-2 pb-3 mb-3 border-b border-primary-hover/10">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-primary2 hover:text-primary-hover hover:bg-primary2/10 bg-primary2/5 border border-primary2/15 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Volver
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-brand-muted uppercase">
              <button onClick={() => navigate('/products')} className="hover:text-primary-hover transition-colors">
                Catálogo
              </button>
              <span>›</span>
              <span className="text-brand-dark normal-case">{product.nombre}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-brand-dark truncate">{product.nombre}</h1>
            <div className="flex items-center gap-2 shrink-0">
              <p className="text-xl font-bold text-brand-dark">S/. {precioUnitario.toFixed(2)}</p>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-brand-muted/15 text-brand-dark font-semibold rounded text-[10px] border border-brand-muted/20 uppercase tracking-wide">
                Calidad garantizada
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-10 lg:flex-1 lg:min-h-0">

          {/* ── Columna de imagen: módulo fijo con sus controles ── */}
          <div className="shrink-0 flex flex-col items-center justify-center">
            <div className="relative bg-white rounded-3xl border border-primary-hover/15 w-[320px] h-[426px] flex items-center justify-center overflow-hidden shadow-sm">
              
              {/* RENDERIZAMOS EL CANVAS AQUÍ PASANDO LOS ESTADOS */}
              <PersonalizadorCanvas
                prendaUrl={assets[product.imagen as keyof typeof assets] || assets['maxwell']}
                color={colorSeleccionado}
                estampadoUrl={imagenEstampado}
                rotacion={estampadoRotacion} // <- Nueva prop
                escala={estampadoEscala}     // <- Nueva prop
              />

              {/* Controles flotantes actualizados con Popover de Zoom */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-full shadow-md border border-primary-hover/10 px-3 py-1.5 z-20">
                
                {/* Botón Vista 3D */}
                <button className="w-8 h-8 rounded-full bg-primary-hover text-white flex items-center justify-center" title="Vista 3D">
                  <Scan size={16} />
                </button>
                
                {/* Botón Rotar */}
                <button 
                  onClick={() => setEstampadoRotacion(r => (r + 90) % 360)}
                  className="w-8 h-8 rounded-full text-brand-dark hover:bg-brand-light flex items-center justify-center transition-colors" 
                  title="Rotar"
                >
                  <RotateCw size={16} />
                </button>
                
                {/* Contenedor del Botón Lupa + Slider Desplegable */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSlider(!showSlider)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      showSlider ? 'bg-primary2/20 text-primary-hover font-bold' : 'text-brand-dark hover:bg-brand-light'
                    }`} 
                    title="Zoom"
                  >
                    <ZoomIn size={16} />
                  </button>

                  {/* Slider Flotante (Se muestra arriba del botón) */}
                  {showSlider && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white border border-primary-hover/15 rounded-xl shadow-xl px-4 py-3 flex items-center gap-2 z-30 min-w-[180px] animate-in fade-in slide-in-from-bottom-2 duration-150">
                      <Minus size={14} className="text-brand-muted shrink-0" />
                      <input
                        type="range"
                        min="0.3"  
                        max="2.5"  
                        step="0.05"
                        value={estampadoEscala}
                        onChange={(e) => setEstampadoEscala(parseFloat(e.target.value))}
                        className="w-28 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary2"
                      />
                      <Plus size={14} className="text-brand-muted shrink-0" />
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* ── Columna de opciones: módulo con scroll interno propio ── */}
          <div className="flex flex-col lg:min-h-0">
          <div className="bg-white rounded-3xl border border-primary-hover/15 flex flex-col lg:flex-1 lg:min-h-0 overflow-hidden">
          <div className="flex-1 lg:min-h-0 lg:overflow-y-auto p-6 lg:pr-4">

            {/* 1. Material */}
            {product.materiales.length > 0 && (
              <div className="mb-8">
                <p className={sectionTitleCls}>1. Material del producto</p>
                <div className="grid grid-cols-2 gap-3">
                  {product.materiales.map(mat => {
                    const info = getMaterial(mat.id);
                    const active = selectedMaterial === mat.id;
                    const costo = Number(mat.costoExtra) || 0;
                    return (
                      <button
                        key={mat.id}
                        onClick={() => setSelectedMaterial(mat.id)}
                        className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition-colors ${
                          active
                            ? 'border-primary2 bg-primary2/10 text-primary-hover'
                            : 'border-primary-hover/20 text-brand-dark hover:bg-brand-light/40'
                        }`}
                      >
                        {info?.nombre ?? `Material #${mat.id}`}
                        {costo > 0 && (
                          <span className="block text-[11px] font-semibold text-brand-muted mt-0.5">
                            +S/. {costo.toFixed(2)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Tipo de personalización */}
            {product.personalizaciones.length > 0 && (
              <div className="mb-8">
                <p className={sectionTitleCls}>2. Tipo de personalización</p>
                <div className="flex flex-wrap gap-6">
                  {product.personalizaciones.map(per => {
                    const info = getPersonalizacion(per.id);
                    const costo = Number(per.costoExtra) || 0;
                    return (
                      <label key={per.id} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-brand-dark">
                        <input
                          type="radio"
                          name="personalizacion"
                          checked={selectedPersonalizacion === per.id}
                          onChange={() => setSelectedPersonalizacion(per.id)}
                          className="w-4 h-4 accent-primary-hover"
                        />
                        {info?.nombre ?? `Personalización #${per.id}`}
                        {costo > 0 && (
                          <span className="text-[11px] font-semibold text-brand-muted">+S/. {costo.toFixed(2)}</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Diseño de personalización */}
            <div className="mb-8">
              <p className={sectionTitleCls}>3. Diseño de personalización</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleUploadClick}
                  className={`flex flex-col items-center justify-center gap-2 py-6 rounded-lg border transition-colors ${
                    designMode === 'upload'
                      ? 'border-primary2 bg-primary2/10 text-primary-hover'
                      : 'border-primary-hover/20 text-brand-dark hover:bg-brand-light/40'
                  }`}
                >
                  <Upload size={22} />
                  <span className="text-sm font-medium">Subir imagen</span>
                  {uploadedFile && (
                    <span className="text-[11px] font-medium text-brand-muted truncate max-w-[90%]">
                      {uploadedFile.name}
                    </span>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {/* Botón de Diseño Predeterminado modificado */}
                <button
                  onClick={() => {
                    setDesignMode('preset');
                    setImagenEstampado(null); // <--- CLAVE: Borra la imagen del cliente del Canvas
                  }}
                  className={`flex flex-col items-center justify-center gap-2 py-6 rounded-lg border transition-colors ${
                    designMode === 'preset'
                      ? 'border-primary2 bg-primary2/10 text-primary-hover'
                      : 'border-primary-hover/20 text-brand-dark hover:bg-brand-light/40'
                    }`}
                >
                  <Palette size={22} />
                  <span className="text-sm font-medium">Diseño predeterminado</span>
                </button>
              </div>
            </div>

            {/* Colores interactivos */}
            <div className="mb-8">
              <p className={sectionTitleCls}>Variantes de Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colores.map(col => {
                  const info = getColor(col.id);
                  const hex = getColorHex(col.id);
                  const esSeleccionado = colorSeleccionado === hex;
                  
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setColorSeleccionado(hex)}
                      className={`flex items-center gap-2 bg-brand-light/40 border rounded-full px-3 py-1 transition-all cursor-pointer
                        ${esSeleccionado ? 'border-primary2 ring-2 ring-primary2/20 font-bold' : 'border-primary2/15'}`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: hex }} />
                      <span className="text-xs text-brand-dark">{info?.nombre ?? `#${col.id}`}</span>
                    </button>
                  );
                })}
                {product.colores.length === 0 && <p className="text-xs text-brand-muted italic">Color único</p>}
              </div>
            </div>

            {/* 5. Talla */}
            {product.tamanos.length > 0 && (
              <div className="mb-4">
                <p className={sectionTitleCls}>5. Talla</p>
                <div className="flex flex-wrap gap-2">
                  {product.tamanos.map(tam => {
                    const info = getTamanoInfo(tam.id);
                    const active = selectedTamano === tam.id;
                    return (
                      <button
                        key={tam.id}
                        onClick={() => setSelectedTamano(tam.id)}
                        className={`min-w-[3rem] px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                          active
                            ? 'bg-primary-hover text-white border-primary-hover'
                            : 'border-primary-hover/20 text-brand-dark hover:bg-brand-light/40'
                        }`}
                      >
                        {info?.nombre ?? `#${tam.id}`}
                      </button>
                    );
                  })}
                </div>
                {dimensionSeleccionada && (
                  <p className="mt-3 text-xs font-medium text-brand-muted bg-brand-light/40 border border-primary2/15 rounded-lg px-3 py-2 inline-block">
                    Dimensiones: {dimensionSeleccionada.ancho} × {dimensionSeleccionada.alto} cm
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Cantidad + Añadir al carrito: fijo al pie del módulo ── */}
          <div className="shrink-0 p-6 pt-4 border-t border-primary-hover/10">
            {(materialExtra > 0 || personalizacionExtra > 0) && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-brand-muted mb-3">
                <span>Precio base S/. {(product.precio_base ?? 0).toFixed(2)}</span>
                {materialExtra > 0 && <span>+ Material S/. {materialExtra.toFixed(2)}</span>}
                {personalizacionExtra > 0 && <span>+ Personalización S/. {personalizacionExtra.toFixed(2)}</span>}
              </div>
            )}

            <p className="text-xs font-medium text-brand-muted mb-3">
              Cantidad disponible a producir: <span className="font-semibold text-brand-dark">{product.maximo_stock}</span> unidades
            </p>

            <div className="flex items-center gap-4">
            <div className="flex items-center border border-primary-hover/20 rounded-lg">
              <button
                onClick={() => setCantidad(c => Math.max(1, c - 1))}
                disabled={cantidad <= 1}
                className="w-9 h-9 flex items-center justify-center text-brand-dark hover:bg-brand-light/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus size={16} />
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={cantidad === 0 ? '' : cantidad}
                onChange={handleCantidadChange}
                onBlur={handleCantidadBlur}
                className="w-12 text-center text-sm font-semibold text-brand-dark bg-transparent outline-none"
              />
              <button
                onClick={() => setCantidad(c => Math.min(product.maximo_stock, c + 1))}
                disabled={cantidad >= product.maximo_stock}
                className="w-9 h-9 flex items-center justify-center text-brand-dark hover:bg-brand-light/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.activo !== 1}
              className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-sm ${
                product.activo === 1
                  ? 'bg-primary2 text-white hover:bg-primary-hover hover:shadow-primary2/20 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart size={18} />
              Añadir al carrito — S/. {precioTotal.toFixed(2)}
            </button>
            </div>
          </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customization;
