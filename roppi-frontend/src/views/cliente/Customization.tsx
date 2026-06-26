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
  Check,
} from 'lucide-react';
import { ProductoGenerico } from '../../types/producto/productoGen.types';
import assets from '../../assets/assets.js';
import { useProductosGenericos } from '../../hooks/useProductos';
import { PersonalizadorCanvas } from '../../components/PersonalizadorCanvas.js';
import { useCarrito } from '../../context/CarritoContext';

const sectionTitleCls = 'text-sm font-semibold text-brand-dark mb-3';

type DesignMode = 'upload' | 'preset';

export const Customization = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Contexto del carrito: addItem agrega la línea, triggerAddAnimation hace la animación
  const { addItem, triggerAddAnimation } = useCarrito();

  // Para el "¡Añadido!"
  const [added, setAdded] = useState(false);
  // Ref del botón "Añadir al carrito" — necesario para calcular la posición de origen de la animación
  const addButtonRef = useRef<HTMLButtonElement>(null);

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedTamano, setSelectedTamano] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [cantidadEdicion, setCantidadEdicion] = useState<string | null>(null);
  const [cantidadError, setCantidadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Inicializa las selecciones por defecto apenas llega el producto
  useEffect(() => {
    if (!product) return;
    setSelectedMaterial(product.materiales[0]?.id ?? null);
    setSelectedPersonalizacion(product.personalizaciones[0]?.id ?? null);
    setSelectedColor(product.colores[0]?.id ?? null);
    setSelectedTamano(product.tamanos[0]?.id ?? null);

    console.log(product);
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
    setUploadError(null);
    if (file) {
      // 1. Validar formato (solo permitimos las extensiones solicitadas)
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Formato no válido. Solo se permiten JPG, JPEG, PNG o WEBP.');
        setUploadedFile(null);
        setImagenEstampado(null);
        // Resetea el input para que pueda volver a elegir el mismo archivo si se equivoca
        if (fileInputRef.current) fileInputRef.current.value = ''; 
        return;
      }

      // 2. Validar peso (Umbral estándar: 5MB)
      const MAX_SIZE_MB = 5;
      const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
      if (file.size > MAX_SIZE_BYTES) {
        setUploadError(`La imagen es muy pesada. El tamaño máximo permitido es ${MAX_SIZE_MB}MB.`);
        setUploadedFile(null);
        setImagenEstampado(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Si pasa las validaciones, actualizamos los estados
      setUploadedFile(file);
      setDesignMode('upload');
      const objectUrl = URL.createObjectURL(file);
      setImagenEstampado(objectUrl);
    } else {
      setImagenEstampado(null);
      setUploadedFile(null);
    }
  };

  const handleUploadClick = () => {
    setDesignMode('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Resetea para que el mismo archivo pueda re-seleccionarse
      fileInputRef.current.click();
    }
  };

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCantidadEdicion(raw);
    if (raw === '') {
      setCantidadError(false);
      return;
    }
    const max = product?.maximo_stock ?? Number.MAX_SAFE_INTEGER;
    setCantidadError(Number(raw) > max);
  };

  const handleCantidadBlur = () => {
    if (cantidadEdicion === null) return;
    const max = product?.maximo_stock ?? Number.MAX_SAFE_INTEGER;
    const val = parseInt(cantidadEdicion, 10);
    setCantidad(isNaN(val) || val < 1 ? 1 : Math.min(val, max));
    setCantidadEdicion(null);
    setCantidadError(false);
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Entidad: LineaCarrito — construye la línea con todos los atributos seleccionados
    addItem({
      productoId: product.id,
      nombre: product.nombre,
      imagenKey: product.imagen,
      atributos: {
        talla: getTamanoInfo(selectedTamano ?? 0)?.nombre ?? '',
        material: getMaterial(selectedMaterial ?? 0)?.nombre ?? '',
        personalizacion:
          selectedPersonalizacion == null
            ? ''
            : (getPersonalizacion(selectedPersonalizacion)?.nombre ??
              `Personalización #${selectedPersonalizacion}`),
        color: getColor(selectedColor ?? 0)?.nombre ?? '',
        colorHex: colorSeleccionado,
      },
      precioUnitario,
      cantidad,
      maximoStock: product.maximo_stock,
    });

    // Disparar animación del dot desde el botón hacia el ícono del carrito en el Header
    if (addButtonRef.current) {
      triggerAddAnimation(addButtonRef.current);
    }

    // Mostrar toast de confirmación brevemente
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    // TODO API: addItem (dentro de CarritoContext) llama a CarritoAPIService.guardarCarrito
    // No se navega — el usuario puede seguir personalizando o ir al carrito manualmente
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
                draggable={false}
                initialPos={{ x: product.posicionX, y: product.posicionY }}
              />
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
                          onChange={() => {
                            setSelectedPersonalizacion(per.id);
                            const nombre = getPersonalizacion(per.id)?.nombre ?? '';
                            if (nombre.toLowerCase() === 'ninguna') {
                              setImagenEstampado(null);
                            }
                          }}
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
            {(() => {
              const personalizacionNombre = getPersonalizacion(selectedPersonalizacion!)?.nombre ?? '';
              const esNinguna = personalizacionNombre.toLowerCase() === 'ninguna';
              if (esNinguna) return null;
              return (
              <div className="mb-8">
                <p className={sectionTitleCls}>3. Diseño de personalización</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleUploadClick}
                    className={`flex flex-col items-center justify-center gap-2 py-6 rounded-lg border transition-colors ${
                      designMode === 'upload'
                        ? 'border-primary2 bg-primary2/10 text-primary-hover'
                        : 'border-primary-hover/20 text-brand-dark hover:bg-brand-light/40'
                    } ${uploadError ? 'border-red-400 bg-red-50' : ''}`} 
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
                      setUploadedFile(null);
                      setUploadError(null);
                      setImagenEstampado(assets['maxwell']); // <--- CLAVE: Borra la imagen del cliente del Canvas
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
                {uploadError && (
                  <p className="text-xs text-red-500 font-medium mt-2">
                    {uploadError}
                  </p>
                )}
              </div>
              );
            })()}
            

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
            <div className={`flex items-center border rounded-lg ${cantidadError ? 'border-red-400' : 'border-primary-hover/20'}`}>
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
                value={cantidadEdicion !== null ? cantidadEdicion : (cantidad === 0 ? '' : cantidad)}
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
            {/* Elemento visual: botón principal de acción — añade al carrito y dispara animación */}
            <button
              ref={addButtonRef}
              onClick={handleAddToCart}
              disabled={product.activo !== 1}
              className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-sm ${
                product.activo === 1
                  ? added
                    ? 'bg-green-500 text-white cursor-pointer'
                    : 'bg-primary2 text-white hover:bg-primary-hover hover:shadow-primary2/20 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {added ? (
                <>
                  <Check size={18} />
                  ¡Añadido al carrito!
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Añadir al carrito — S/. {precioTotal.toFixed(2)}
                </>
              )}
            </button>
            </div>
            {cantidadError && (
              <p className="text-[11px] text-red-500 font-medium mt-1.5">
                No puede exceder la capacidad máxima
              </p>
            )}
          </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customization;
