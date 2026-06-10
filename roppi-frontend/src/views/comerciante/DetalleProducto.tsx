import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Button, TextField, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { Trash2, Save, Edit, X, Upload, ImageMinus } from 'lucide-react';
import { GenericoXColor, GenericoXMaterial, GenericoXPersonalizacion, GenericoXTamano } from '../../types/producto/genericoAtributos.types';
import { ProductoGenerico, CreateProductGenericoDTO } from '../../types/producto/productoGen.types';
import assets from '../../assets/assets.js';
import { useProductosGenericos } from '../../hooks/useProductos';

type Mode = 'view' | 'create' | 'edit';

export default function DetalleProducto(){
    type ViewMode = 'view' | 'create' | 'edit';

    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estado local para la previsualización de la imagen (Base64 local)
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const state = location.state as { productoId?: number } | null;
    const id_nav = state?.productoId;
    
    const [view, setView] = useState<ViewMode>(
    location.pathname.includes('/new') ? 'create' : 'view');

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
      loading: loadingHook 
    } = useProductosGenericos();

  const [product, setProduct] = useState<ProductoGenerico | null>(null);
  const [editedProduct, setEditedProduct] = useState<ProductoGenerico | null>(null);
  const [loadingLocal, setLoadingLocal] = useState<boolean>(false);

  const getMaterial        = (idMat: number) => materiales.find(m => m.id === idMat);
  const getColor           = (idCol: number) => colores.find(c => c.id === idCol);
  const getTamano          = (idTam: number) => tamano.find(s => s.id === idTam);
  const getPersonalizacion = (idPer: number) => personalizaciones.find(p => p.id === idPer);

  // Helper para resolver la imagen a mostrar
  const renderImage = () => {
    // Si hay una previsualización en progreso (bucle de edición/creación), mostramos esa
    if (isEditable && imagePreview) return imagePreview;
    
    const currentImgName = isEditable ? editedProduct?.imagen : product?.imagen;
    
    // Si tiene un nombre asignado, intentamos buscarlo en assets
    if (currentImgName) {
      return assets[currentImgName as keyof typeof assets] || assets["maxwell"];
    }
    
    // Fallback por defecto si no hay imagen
    return assets["maxwell"];
  };

  useEffect(() => {
    // CREATE
    if (view === 'create') {
      const emptyproduct: ProductoGenerico = ({
        id: 0,
        nombre: '',
        activo: 1,
        precio_base: 0,
        maximo_stock: 0,
        descripcion: '',
        imagen: 'maxwell', // Nombre por defecto por si no suben nada
        materiales: [],
        colores: [],
        tamanos: [],
        personalizaciones: []
      });
      setEditedProduct(emptyproduct);
      setProduct(null);
      setImagePreview(null);
      return;
    }

    // EDIT / VIEW
    const fetchSingleProduct = async () => {
      if (!id_nav) return;
      try {
        setLoadingLocal(true);
        const data = await getProductoById(Number(id_nav)); 

        setProduct(data);
        setEditedProduct(data);
        setImagePreview(null); // Reseteamos la preview local al cargar un nuevo producto
      } catch (err) {
        console.error("No se pudo cargar el producto", err);
      } finally {
        setLoadingLocal(false);
      }
    };

  fetchSingleProduct();
  }, [view, id_nav, getProductoById]);

  // Manejador del cambio de archivo (Input File)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editedProduct) return;

    // 1. Guardamos SOLAMENTE el nombre del archivo en el DTO/Estado
    setEditedProduct({
      ...editedProduct,
      imagen: file.name
    });

    // 2. Generamos una URL temporal local para renderizar la preview en el cliente
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Quitar la imagen actual del formulario
  const handleRemoveImage = () => {
    if (!editedProduct) return;
    setEditedProduct({
      ...editedProduct,
      imagen: '' // Enviará un string vacío o puedes mapearlo a null/default según tu BD
    });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = ''; // Limpiar el input file
  };

  const handleStartEdit = () => {
    setView('edit');
  };

  const handleSave = async () => {
    if (!editedProduct) return;
    try {
      const productoDTO: CreateProductGenericoDTO = {
        nombre: editedProduct.nombre,
        descripcion: editedProduct.descripcion,
        precio_base: editedProduct.precio_base,
        activo: editedProduct.activo,
        maximo_stock: editedProduct.maximo_stock,
        imagen: editedProduct.imagen, // Aquí ya viaja solo el string "nombre_archivo.jpg"
        colores: editedProduct.colores,
        materiales: editedProduct.materiales,
        tamanos: editedProduct.tamanos,
        personalizaciones: editedProduct.personalizaciones
      };

      if (view === 'create') {
        const nuevo = await addProducto(productoDTO);
        setView('view');
      } else if (view === 'edit' && id_nav) {
        const actualizado = await updateProducto(id_nav, productoDTO);
        setProduct(actualizado);
        setEditedProduct(actualizado);
        setView('view');
      }
    } catch (error) {
      alert('Error al intentar guardar el producto.');
    }
  };

  const handleCancel = () => {
    setEditedProduct(product);
    setImagePreview(null);
    if (view === 'create') {
      navigate('/comerciante/products');
    } else {
      setView('view');
    }
  };

  const handleDelete = async () => {
    if (id_nav && window.confirm('¿Estás seguro de que quieres desactivar este producto?')) {
      try {
        await deleteProducto(id_nav);
        navigate('/comerciante/products');
      } catch (error) {
        alert('Error al desactivar el producto.');
      }
    }
  };

const currentProduct = isEditable ? editedProduct : product;

if (loadingHook || loadingLocal) {
    return <div className="p-8 text-center text-lg font-medium">Cargando información...</div>;
}

if (!currentProduct) {
    return <div className="p-8 text-center text-red-500">Producto no encontrado o sesión expirada (F5).</div>;
  }
  
  const handleAddMaterial = (materialId: number) => {
    if (materiales.find(m => m.id === materialId) && !currentProduct.materiales.find(m => m.id_material === materialId)) {
      const materialgen: GenericoXMaterial = { id_material: materialId, costo_extra: 0 };
      setEditedProduct({
        ...currentProduct,
        materiales: [...currentProduct.materiales, materialgen]
      });
    }
  };

  const handleAddColor = (colorId: number) => {
    if (colores.find(c => c.id === colorId) && !currentProduct.colores.find(c => c.id_color === colorId)) {
      const colorgen: GenericoXColor = { id_color: colorId };
      setEditedProduct({
        ...currentProduct,
        colores: [...currentProduct.colores, colorgen]
      });
    }
  };

  const handleAddSize = (sizeId: number) => {
    if (tamano.find(s => s.id === sizeId) && !currentProduct.tamanos.find(s => s.id_tamano === sizeId)) {
      const tamanogen: GenericoXTamano = { id_tamano: sizeId, ancho: 0, alto: 0 };
      setEditedProduct({
        ...currentProduct,
        tamanos: [...currentProduct.tamanos, tamanogen]
      });
    }
  };

  const handleAddCustomization = (customizationId: number) => {
    if (personalizaciones.find(c => c.id === customizationId) && !currentProduct.personalizaciones.find(c => c.id_personalizacion === customizationId)) {
      const personalizaciongen: GenericoXPersonalizacion = { id_personalizacion: customizationId, costo_extra: 0 };
      setEditedProduct({
        ...currentProduct,
        personalizaciones: [...currentProduct.personalizaciones, personalizaciongen]
      });
    }
  };

  const getAvailableMaterials = () => materiales.filter(m => !currentProduct.materiales.find(em => em.id_material === m.id));
  const getAvailableColors = () => colores.filter(c => !currentProduct.colores.find(ec => ec.id_color === c.id));
  const getAvailableSizes = () => tamano.filter(s => !currentProduct.tamanos.find(es => es.id_tamano === s.id));
  const getAvailableCustomizations = () => personalizaciones.filter(c => !currentProduct.personalizaciones.find(ec => ec.id_personalizacion === c.id));

  return (
    <>
    <div className="flex-1 min-h-0 overflow-auto bg-gray-50">
    <div className="p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <div className="flex gap-2">
            {view === 'view' && (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Edit size={20} />}
                  onClick={handleStartEdit}
                >
                  Editar
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Trash2 size={20} />}
                  onClick={handleDelete}
                >
                  Desactivar
                </Button>
              </>
            )}
            {isEditable && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Save size={20} />}
                  onClick={handleSave}
                >
                  Guardar
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<X size={20} />}
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>

      <div className="grid grid-cols-[400px_1fr] gap-8">
        {/* Sección de Imagen del producto */}
        <div className="space-y-4">
          <div className="relative group">
            <img
              src={renderImage()}
              alt={currentProduct.nombre || "Previsualización"}
              className="w-full h-[600px] object-cover rounded-lg border-2 border-gray-200"
            />
            
            {/* Overlay interactivo si está en modo creación o edición */}
            {isEditable && (
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="contained"
                  color="primary"
                  component="label"
                  startIcon={<Upload size={16} />}
                  size="small"
                >
                  {currentProduct.imagen ? 'Cambiar' : 'Subir'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </Button>
                {currentProduct.imagen && (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<ImageMinus size={16} />}
                    size="small"
                    onClick={handleRemoveImage}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Muestra informativa del nombre del archivo en modo edición */}
          {isEditable && (
            <p className="text-xs text-gray-500 break-all text-center">
              Archivo asignado: <span className="font-mono font-bold">{currentProduct.imagen || '(Ninguno)'}</span>
            </p>
          )}
        </div>

        {/* Atributos del producto */}
        <div className="space-y-6">
          {/* Nombre y Estado */}
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              {isEditable ? (
                <TextField
                  fullWidth
                  label="Nombre del producto"
                  value={currentProduct.nombre}
                  onChange={(e) => setEditedProduct({ ...currentProduct, nombre: e.target.value })}
                  variant="outlined"
                />
              ) : (
                <p className="text-2xl font-semibold">{currentProduct.nombre}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={currentProduct.activo ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {currentProduct.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Precio Base */}
          <div>
            {isEditable ? (
              <TextField
                fullWidth
                label="Precio base"
                type="number"
                value={currentProduct.precio_base}
                onChange={(e) => setEditedProduct({ ...currentProduct, precio_base: Number(e.target.value) })}
                slotProps={{ input: {startAdornment: <InputAdornment position="start">S/.</InputAdornment>} }}
              />
            ) : (
              <p className="text-xl font-semibold">S/. {currentProduct.precio_base}</p>
            )}
          </div>

          {/* Stock Máximo */}
          <div>
            {isEditable ? (
              <TextField
                fullWidth
                label="Stock máximo"
                type="number"
                value={currentProduct.maximo_stock}
                onChange={(e) => setEditedProduct({ ...currentProduct, maximo_stock: Number(e.target.value) })}
              />
            ) : (
              <div>
                <label className="text-sm text-gray-500">Stock máximo</label>
                <p className="text-lg font-medium">{currentProduct.maximo_stock} unidades</p>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div>
            {isEditable ? (
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={currentProduct.descripcion}
                onChange={(e) => setEditedProduct({ ...currentProduct, descripcion: e.target.value })}
              />
            ) : (
              <div>
                <label className="text-sm text-gray-500">Descripción</label>
                <p className="text-base">{currentProduct.descripcion}</p>
              </div>
            )}
          </div>

          {/* Materiales */}
            <div className="border-t pt-6">
             <h3 className="font-semibold text-lg mb-3">Materiales</h3>
             <div className="space-y-2">
               {currentProduct.materiales.map((mat, index) => {
                  const info = getMaterial(mat.id_material);
                  return (
                    <div key={mat.id_material} className="flex gap-3 items-center p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium">{info?.nombre ?? `Material #${mat.id_material}`}</p>
                      {info?.descripcion && <p className="text-xs text-gray-500">{info.descripcion}</p>}
                    </div>
                    {isEditable ? (
                      <>
                        <TextField
                          label="Costo extra"
                          type="number"
                          size="small"
                          value={mat.costo_extra}
                          onChange={(e) => {
                            const updated = [...currentProduct.materiales];
                            updated[index] = { ...updated[index], costo_extra: Number(e.target.value) };
                            setEditedProduct({ ...currentProduct, materiales: updated });
                          }}
                          slotProps={{ input: { startAdornment: <InputAdornment position="start">S/.</InputAdornment> } }}
                          sx={{ width: 160 }}
                        />
                        <IconButton size="small" color="error"
                          onClick={() => setEditedProduct({
                            ...currentProduct,
                          materiales: currentProduct.materiales.filter(m => m.id_material !== mat.id_material)
                        })}>
                        <Trash2 size={18} />
                        </IconButton>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">+S/. {mat.costo_extra}</p>
                    )}
                  </div>
                );
              })}
              {isEditable && getAvailableMaterials().length > 0 && (
                <FormControl fullWidth size="small">
                  <InputLabel>Agregar material</InputLabel>
                  <Select value="" onChange={(e) => handleAddMaterial(Number(e.target.value))} label="Agregar material">
                    {getAvailableMaterials().map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.nombre} — {m.descripcion}
                      </MenuItem>
                    ))}
                    </Select>
                  </FormControl>
                )}
              </div>
            </div>

          {/* Colores */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-3">Colores</h3>
              <div className="space-y-2">
                {currentProduct.colores.map((col) => {
                  const info = getColor(col.id_color);
                  return (
                    <div key={col.id_color} className="flex gap-3 items-center p-3 bg-gray-50 rounded">
                      <div className="w-8 h-8 rounded border-2 border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: info?.pantone ?? '#ccc' }} />
                      <div className="flex-1">
                        <p className="font-medium">{info?.nombre ?? `Color #${col.id_color}`}</p>
                      </div>
                      {isEditable && (
                        <IconButton size="small" color="error"
                          onClick={() => setEditedProduct({
                            ...currentProduct,
                            colores: currentProduct.colores.filter(c => c.id_color !== col.id_color)
                          })}>
                          <Trash2 size={18} />
                        </IconButton>
                      )}
                    </div>
                  );
                })}
                {isEditable && getAvailableColors().length > 0 && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Agregar color</InputLabel>
                    <Select value="" onChange={(e) => handleAddColor(Number(e.target.value))} label="Agregar color">
                      {getAvailableColors().map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded border" style={{ backgroundColor: c.pantone }} />
                            {c.nombre}
                          </div>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </div>
            </div>

            {/* Tamaños */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-3">Tamaños</h3>
              <div className="space-y-2">
                {currentProduct.tamanos.map((tam, index) => {
                  const info = getTamano(tam.id_tamano);
                  return (
                    <div key={tam.id_tamano} className="flex gap-3 items-center p-3 bg-gray-50 rounded">
                      <div className="w-24 flex-shrink-0">
                        <p className="font-medium">{info?.nombre ?? `Talla #${tam.id_tamano}`}</p>
                        {info?.descripcion && <p className="text-xs text-gray-500">{info.descripcion}</p>}
                      </div>
                      {isEditable ? (
                        <>
                          <TextField
                            label="Ancho (cm)" type="number" size="small" value={tam.ancho}
                            onChange={(e) => {
                              const updated = [...currentProduct.tamanos];
                              updated[index] = { ...updated[index], ancho: Number(e.target.value) };
                              setEditedProduct({ ...currentProduct, tamanos: updated });
                            }}
                            sx={{ width: 120 }}
                          />
                          <TextField
                            label="Alto (cm)" type="number" size="small" value={tam.alto}
                            onChange={(e) => {
                              const updated = [...currentProduct.tamanos];
                              updated[index] = { ...updated[index], alto: Number(e.target.value) };
                              setEditedProduct({ ...currentProduct, tamanos: updated });
                            }}
                            sx={{ width: 120 }}
                          />
                          <IconButton size="small" color="error"
                            onClick={() => setEditedProduct({
                              ...currentProduct,
                              tamanos: currentProduct.tamanos.filter(s => s.id_tamano !== tam.id_tamano)
                            })}>
                            <Trash2 size={18} />
                          </IconButton>
                        </>
                      ) : (
                        <p className="text-sm text-gray-600">{tam.ancho} cm × {tam.alto} cm</p>
                      )}
                    </div>
                  );
                })}
                {isEditable && getAvailableSizes().length > 0 && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Agregar tamaño</InputLabel>
                    <Select value="" onChange={(e) => handleAddSize(Number(e.target.value))} label="Agregar tamaño">
                      {getAvailableSizes().map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.nombre} — {s.descripcion}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </div>
            </div>

            {/* Personalizaciones */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-3">Personalizaciones</h3>
              <div className="space-y-2">
                {currentProduct.personalizaciones.map((per, index) => {
                  const info = getPersonalizacion(per.id_personalizacion);
                  return (
                    <div key={per.id_personalizacion} className="flex gap-3 items-center p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium">{info?.nombre ?? `Personalización #${per.id_personalizacion}`}</p>
                        {info?.descripcion && <p className="text-xs text-gray-500">{info.descripcion}</p>}
                      </div>
                      {isEditable ? (
                        <>
                          <TextField
                            label="Costo extra" type="number" size="small" value={per.costo_extra}
                            onChange={(e) => {
                              const updated = [...currentProduct.personalizaciones];
                              updated[index] = { ...updated[index], costo_extra: Number(e.target.value) };
                              setEditedProduct({ ...currentProduct, personalizaciones: updated });
                            }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start">S/.</InputAdornment> } }}
                            sx={{ width: 160 }}
                          />
                          <IconButton size="small" color="error"
                            onClick={() => setEditedProduct({
                              ...currentProduct,
                              personalizaciones: currentProduct.personalizaciones.filter(p => p.id_personalizacion !== per.id_personalizacion)
                            })}>
                            <Trash2 size={18} />
                          </IconButton>
                        </>
                      ) : (
                        <p className="text-sm text-gray-600">+S/. {per.costo_extra}</p>
                      )}
                    </div>
                  );
                })}
                {isEditable && getAvailableCustomizations().length > 0 && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Agregar personalización</InputLabel>
                    <Select value="" onChange={(e) => handleAddCustomization(Number(e.target.value))} label="Agregar personalización">
                      {getAvailableCustomizations().map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.nombre} — {p.descripcion}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </div>
            </div>
        </div>
      </div>
      </div>
    </div>
    </div>
    </>
  );
}