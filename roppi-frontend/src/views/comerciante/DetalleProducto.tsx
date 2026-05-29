import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Button, TextField, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { Plus, Trash2, Save, Edit, X } from 'lucide-react';
import { Material } from '../../types/producto/material.types';
import { Color } from '../../types/producto/color.types';
import { Tamano } from '../../types/producto/tamano.types';
import { Personalizacion } from '../../types/producto/personalizacion.types';
import { GenericoXColor, GenericoXMaterial, GenericoXPersonalizacion, GenericoXTamano } from '../../types/producto/genericoAtributos.types';
import { ProductoGenerico } from '../../types/producto/productoGen.types';
import assets from '../../assets/assets.js';

type Mode = 'view' | 'create' | 'edit';

// Listas predefinidas
const AVAILABLE_MATERIALS: Material[] = [
  { id: 1, nombre: 'Algodón', descripcion: '', activo:1},
  { id: 2, nombre: 'Poliéster', descripcion: '', activo:1 },
  { id: 3, nombre: 'Lino', descripcion: '', activo:1 },
  { id: 4, nombre: 'Seda', descripcion: '', activo:1 },
  { id: 5, nombre: 'Lana', descripcion: '', activo:1 }
];

const AVAILABLE_COLORS: Color[] = [
  { id: 1, nombre: 'Negro', pantone: '#000000', activo:1 },
  { id: 2, nombre: 'Blanco', pantone: '#FFFFFF', activo:1},
  { id: 3, nombre: 'Rojo', pantone: '#FF0000', activo:1},
  { id: 4, nombre: 'Azul', pantone: '#0000FF', activo:1},
  { id: 5, nombre: 'Verde', pantone: '#00FF00', activo:1},
  { id: 6, nombre: 'Amarillo', pantone: '#FFFF00', activo:1 },
  { id: 7, nombre: 'Gris', pantone: '#808080', activo:1 },
  { id: 8, nombre: 'Rosa', pantone: '#FFC0CB', activo:1 }
];

const AVAILABLE_SIZES: Tamano[] = [
  { id: 1, nombre: 'XS', descripcion:'', activo:1},
  { id: 2, nombre: 'S', descripcion:'', activo:1 },
  { id: 3, nombre: 'M', descripcion:'', activo:1 },
  { id: 4, nombre: 'L', descripcion:'', activo:1 },
  { id: 5, nombre: 'XL', descripcion:'', activo:1 },
  { id: 6, nombre: 'XXL', descripcion:'', activo:1 }
];

const AVAILABLE_CUSTOMIZATIONS: Personalizacion[] = [
  { id: 1, nombre: 'Bordado nombre', descripcion:'', activo:1 },
  { id: 2, nombre: 'Estampado personalizado', descripcion:'', activo:1 },
  { id: 3, nombre: 'Bordado logo', descripcion:'', activo:1 },
  { id: 4, nombre: 'Parche personalizado', descripcion:'', activo:1 },
  { id: 5, nombre: 'Serigrafía', descripcion:'', activo:1 }
];

const defaultProduct: ProductoGenerico = {
  id: 1,
  nombre: 'Camiseta Premium',
  activo: 1,
  precio_base: 299,
  maximo_stock: 100,
  descripcion: 'Camiseta de alta calidad con diseño moderno',
  materiales: [
    { id_material: 1, costo_extra: 150 },
    { id_material: 2, costo_extra: 50 }
  ],
  colores: [
    { id_color: 1},
    { id_color: 2}
  ],
  tamanos: [
    { id_tamano: 1, ancho: 45, alto: 65 },
    { id_tamano: 2, ancho: 50, alto: 70 },
    { id_tamano: 3, ancho: 55, alto: 75 }
  ],
  personalizaciones: [
    { id_personalizacion: 1, costo_extra: 100 },
    { id_personalizacion: 2, costo_extra: 150 }
  ]
};

// ─── Helpers: resuelven un ID a su objeto maestro ──────────────────────────
// Devuelven el objeto completo o undefined si no se encuentra.
const getMaterial       = (id: number) => AVAILABLE_MATERIALS.find(m => m.id === id);
const getColor          = (id: number) => AVAILABLE_COLORS.find(c => c.id === id);
const getTamano         = (id: number) => AVAILABLE_SIZES.find(s => s.id === id);
const getPersonalizacion= (id: number) => AVAILABLE_CUSTOMIZATIONS.find(p => p.id === id);


export default function DetalleProducto(){
    const location = useLocation();
    const navigate = useNavigate();

    const mode: Mode =
    location.pathname.includes('/new')
        ? 'create'
        : location.pathname.includes('/edit')
        ? 'edit'
        : 'view';

  const [product, setProduct] = useState<ProductoGenerico | null>(null);
  const [editedProduct, setEditedProduct] = useState<ProductoGenerico | null>(null);

  const isEditable = mode === 'create' || mode === 'edit';

  useEffect(() => {

    // CREATE
    if (mode === 'create') {

      const emptyproduct: ProductoGenerico = ({
        id: 0,
        nombre: '',
        activo: 1,
        precio_base: 0,
        maximo_stock: 0,
        descripcion: '',
        materiales: [],
        colores: [],
        tamanos: [],
        personalizaciones: []
      });

      setEditedProduct(emptyproduct);

      return;
    }

    // EDIT / VIEW
    // aquí luego irá tu fetch por id

    const fetchProduct = async () => {

    // MOCK
    const data = defaultProduct;

    // FUTURO:
    // const data = await api.getProduct(id)

    setProduct(data);
    setEditedProduct(data);
  };

  fetchProduct();

  }, [mode, product]);

  const handleStartEdit = () => {
    navigate(`/products/edit/`); // navigate(`/products/edit/${id}`);
  };

  const handleSave = () => {

/*    const handleSave = async () => {

  try {

    let response;

    // CREATE
    if (mode === 'create') {

      response = await api.post(
        '/productos',
        editedProduct
      );

    } else {

      // EDIT
      response = await api.put(
        `/productos/${editedProduct.id}`,
        editedProduct
      );
    }

    const savedProduct = response.data;

    // sincronizar estados locales
    setProduct(savedProduct);

    setEditedProduct(savedProduct);

    // volver a detalle
    navigate(`/products/${savedProduct.id}`);

  } catch (error) {

    console.error(error);

    alert('Error al guardar');
  }
};*/

    setProduct(editedProduct);
    navigate(`/products/view`);// navigate(`/products/${editedProduct.id}`);
  };

  const handleCancel = () => {
    setEditedProduct(product);
    navigate(`/products/view`);// navigate(`/products/${editedProduct.id}`);
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este producto?')) {
        // API
        navigate('/products');
    }
  };

const currentProduct = isEditable ? editedProduct : product;

if (!currentProduct) {
  return <div>Cargando...</div>;
}
if (!editedProduct) return;
  
/* Manejo para añadir relaciones del producto generico */

  const handleAddMaterial = (materialId: number) => {
    const material = AVAILABLE_MATERIALS.find(m => m.id === materialId);
    if (material && !currentProduct.materiales.find(m => m.id_material === materialId)) {
        const materialgen: GenericoXMaterial = { id_material:materialId, costo_extra:0 }
      setEditedProduct({
        ...currentProduct,
        materiales: [...currentProduct.materiales, { ...materialgen }]
      });
    }
  };

  const handleAddColor = (colorId: number) => {
    const color = AVAILABLE_COLORS.find(c => c.id === colorId);
    if (color && !editedProduct.colores.find(c => c.id_color === colorId)) {
        const colorgen: GenericoXColor = { id_color:colorId}
      setEditedProduct({
        ...editedProduct,
        colores: [...editedProduct.colores, { ...colorgen }]
      });
    }
  };

  const handleAddSize = (sizeId: number) => {
    const size = AVAILABLE_SIZES.find(s => s.id === sizeId);
    if (size && !editedProduct.tamanos.find(s => s.id_tamano === sizeId)) {
        const tamanogen: GenericoXTamano = { id_tamano:sizeId, ancho:0, alto:0}
      setEditedProduct({
        ...editedProduct,
        tamanos: [...editedProduct.tamanos, { ...tamanogen }]
      });
    }
  };

  const handleAddCustomization = (customizationId: number) => {
    const customization = AVAILABLE_CUSTOMIZATIONS.find(c => c.id === customizationId);
    if (customization && !editedProduct.personalizaciones.find(c => c.id_personalizacion === customizationId)) {
        const personalizaciongen: GenericoXPersonalizacion = {id_personalizacion:customizationId, costo_extra:0}
        setEditedProduct({
        ...editedProduct,
        personalizaciones: [...editedProduct.personalizaciones, { ...personalizaciongen }]
      });
    }
  };

  const getAvailableMaterials = () => AVAILABLE_MATERIALS.filter(m => !editedProduct.materiales.find(em => em.id_material === m.id));
  const getAvailableColors = () => AVAILABLE_COLORS.filter(c => !editedProduct.colores.find(ec => ec.id_color === c.id));
  const getAvailableSizes = () => AVAILABLE_SIZES.filter(s => !editedProduct.tamanos.find(es => es.id_tamano === s.id));
  const getAvailableCustomizations = () => AVAILABLE_CUSTOMIZATIONS.filter(c => !editedProduct.personalizaciones.find(ec => ec.id_personalizacion === c.id));

  return (
    <>
    <div className="size-full min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <div className="flex gap-2">
            {mode === 'view' && (
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
        {/* Imagen del producto */}
        <div className="space-y-4">
          <img
            src={assets.maxwell}
            alt={"maxwell sorpresa"}
            className="w-full h-[600px] object-cover rounded-lg border-2 border-gray-200"
          />
          {/*{isEditable && (
            <TextField
              fullWidth
              label="URL de imagen"
              value={assets.maxwell}
              //onChange={(e) => setEditedProduct({ ...editedProduct, imageUrl: e.target.value })} por ahora no va porque no estamos viendo imágenes
              size="small"
            />
          )}*/}
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
                  onChange={(e) => setEditedProduct({ ...editedProduct, nombre: e.target.value })}
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
                onChange={(e) => setEditedProduct({ ...editedProduct, precio_base: Number(e.target.value) })}
                slotProps={{ input: {startAdornment: <InputAdornment position="start">S/.</InputAdornment>} }}
              />
            ) : (
              <p className="text-xl font-semibold">${currentProduct.precio_base}</p>
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
                onChange={(e) => setEditedProduct({ ...editedProduct, maximo_stock: Number(e.target.value) })}
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
                onChange={(e) => setEditedProduct({ ...editedProduct, descripcion: e.target.value })}
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
                  // Resolvemos el ID al objeto maestro para mostrar nombre/descripción
                  const info = getMaterial(mat.id_material);
                  return (
                    <div key={mat.id_material} className="flex gap-3 items-center p-3 bg-gray-50 rounded">
                    {/* Nombre y descripción provienen del objeto maestro */}
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
                            // Actualizamos solo el atributo extra; el id_material no cambia
                            const updated = [...editedProduct.materiales];
                            updated[index] = { ...updated[index], costo_extra: Number(e.target.value) };
                            setEditedProduct({ ...editedProduct, materiales: updated });
                          }}
                          slotProps={{ input: { startAdornment: <InputAdornment position="start">S/.</InputAdornment> } }}
                          sx={{ width: 160 }}
                        />
                        <IconButton size="small" color="error"
                          onClick={() => setEditedProduct({
                            ...editedProduct,
                          materiales: editedProduct.materiales.filter(m => m.id_material !== mat.id_material)
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
                            ...editedProduct,
                            colores: editedProduct.colores.filter(c => c.id_color !== col.id_color)
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
                              const updated = [...editedProduct.tamanos];
                              updated[index] = { ...updated[index], ancho: Number(e.target.value) };
                              setEditedProduct({ ...editedProduct, tamanos: updated });
                            }}
                            sx={{ width: 120 }}
                          />
                          <TextField
                            label="Alto (cm)" type="number" size="small" value={tam.alto}
                            onChange={(e) => {
                              const updated = [...editedProduct.tamanos];
                              updated[index] = { ...updated[index], alto: Number(e.target.value) };
                              setEditedProduct({ ...editedProduct, tamanos: updated });
                            }}
                            sx={{ width: 120 }}
                          />
                          <IconButton size="small" color="error"
                            onClick={() => setEditedProduct({
                              ...editedProduct,
                              tamanos: editedProduct.tamanos.filter(s => s.id_tamano !== tam.id_tamano)
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
                              const updated = [...editedProduct.personalizaciones];
                              updated[index] = { ...updated[index], costo_extra: Number(e.target.value) };
                              setEditedProduct({ ...editedProduct, personalizaciones: updated });
                            }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start">S/.</InputAdornment> } }}
                            sx={{ width: 160 }}
                          />
                          <IconButton size="small" color="error"
                            onClick={() => setEditedProduct({
                              ...editedProduct,
                              personalizaciones: editedProduct.personalizaciones.filter(p => p.id_personalizacion !== per.id_personalizacion)
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
    </>
  );
};