import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { ShoppingCart } from 'lucide-react';
import { ProductoGenerico } from '../../types/producto/productoGen.types';
import assets from '../../assets/assets.js';
import { useProductosGenericos } from '../../hooks/useProductos';

export default function DetalleProducto(){
    const location = useLocation();
    const navigate = useNavigate();

// Sacamos el ID desde el estado oculto de la navegación
  const state = location.state as { productoId?: number } | null;
  const id_nav = state?.productoId;

  // Extraemos las funciones y catálogos necesarios del hook
  const { 
    colores = [],           
    materiales = [],        
    tamano = [],           
    personalizaciones = [], 
    getProductoById, 
    loading: loadingHook 
  } = useProductosGenericos();

  const [product, setProduct] = useState<ProductoGenerico | null>(null);
  const [loadingLocal, setLoadingLocal] = useState<boolean>(false);

// 4. Helpers dinámicos usando las listas maestras de la base de datos
  const getMaterial        = (idMat: number) => materiales.find(m => m.id === idMat);
  const getColor           = (idCol: number) => colores.find(c => c.id === idCol);
  const getTamano          = (idTam: number) => tamano.find(s => s.id === idTam);
  const getPersonalizacion = (idPer: number) => personalizaciones.find(p => p.id === idPer);

useEffect(() => {
    const fetchSingleProduct = async () => {
      if (!id_nav) return;
      try {
        setLoadingLocal(true);
        const data = await getProductoById(Number(id_nav)); // Llamada directa a la API
        setProduct(data);
      } catch (err) {
        console.error("No se pudo cargar el producto", err);
      } finally {
        setLoadingLocal(false);
      }
    };

    fetchSingleProduct();
  }, [id_nav, getProductoById]);

  // Manejo de la acción "Agregar" (Próximo incremento)
  const handleAddToCart = () => {
    console.log("Agregar producto presionado: listo para redirección a personalización");
    // Aquí irá la lógica de redirección en el futuro
  };

  if (loadingHook || loadingLocal) {
    return <div className="p-8 text-center text-lg font-medium">Cargando información...</div>;
  }

  if (!product) {
    return <div className="p-8 text-center text-red-500">Producto no encontrado o sesión expirada (F5).</div>;
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto bg-gray-50">
      <div className="p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-[400px_1fr] gap-8">
            
            {/* Imagen del producto */}
            <div className="space-y-4">
              <img
                src={assets.maxwell}
                alt="Imagen del producto"
                className="w-full h-[600px] object-cover rounded-lg border-2 border-gray-200"
              />
            </div>

            {/* Atributos del producto */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                
                {/* Nombre y Estado */}
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <p className="text-2xl font-semibold text-brand-dark">{product.nombre}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={product.activo ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {product.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                {/* Precio Base */}
                <div>
                  <label className="text-sm text-gray-500 font-medium">Precio base</label>
                  <p className="text-2xl font-bold text-primary-hover">S/. {product.precio_base}</p>
                </div>

                {/* Stock Máximo */}
                <div>
                  <label className="text-sm text-gray-500 font-medium">Stock disponible</label>
                  <p className="text-lg font-medium text-brand-dark">{product.maximo_stock} unidades</p>
                </div>

                {/* Descripción */}
                <div>
                  <label className="text-sm text-gray-500 font-medium">Descripción</label>
                  <p className="text-base text-gray-700 leading-relaxed">{product.descripcion}</p>
                </div>

                {/* Materiales */}
                {product.materiales.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-2 text-brand-dark">Materiales Disponibles</h3>
                    <div className="space-y-1.5">
                      {product.materiales.map((mat) => {
                        const info = getMaterial(mat.id_material);
                        return (
                          <div key={mat.id_material} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm text-brand-dark">{info?.nombre ?? `Material #${mat.id_material}`}</p>
                              {info?.descripcion && <p className="text-xs text-gray-500">{info.descripcion}</p>}
                            </div>
                            <p className="text-xs font-semibold text-gray-600">+S/. {mat.costo_extra}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Colores */}
                {product.colores.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-2 text-brand-dark">Colores Disponibles</h3>
                    <div className="flex flex-wrap gap-3">
                      {product.colores.map((col) => {
                        const info = getColor(col.id_color);
                        return (
                          <div key={col.id_color} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-400 flex-shrink-0"
                              style={{ backgroundColor: info?.pantone ?? '#ccc' }} 
                            />
                            <span className="text-xs font-medium text-brand-dark">{info?.nombre ?? `Color #${col.id_color}`}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tamaños */}
                {product.tamanos.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-2 text-brand-dark">Guía de Tamaños</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {product.tamanos.map((tam) => {
                        const info = getTamano(tam.id_tamano);
                        return (
                          <div key={tam.id_tamano} className="p-2.5 bg-gray-50 rounded-lg flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm text-brand-dark">{info?.nombre ?? `Talla #${tam.id_tamano}`}</p>
                              {info?.descripcion && <p className="text-xs text-gray-500">{info.descripcion}</p>}
                            </div>
                            <p className="text-xs text-brand-muted">{tam.ancho} cm × {tam.alto} cm</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Personalizaciones */}
                {product.personalizaciones.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-2 text-brand-dark">Opciones de Personalización</h3>
                    <div className="space-y-1.5">
                      {product.personalizaciones.map((per) => {
                        const info = getPersonalizacion(per.id_personalizacion);
                        return (
                          <div key={per.id_personalizacion} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm text-brand-dark">{info?.nombre ?? `Personalización #${per.id_personalizacion}`}</p>
                              {info?.descripcion && <p className="text-xs text-gray-500">{info.descripcion}</p>}
                            </div>
                            <p className="text-xs font-semibold text-gray-600">+S/. {per.costo_extra}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Acción Principal para el Cliente */}
              <div className="pt-6 border-t mt-auto">
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  color="primary"
                  startIcon={<ShoppingCart size={20} />}
                  onClick={handleAddToCart}
                  sx={{
                    backgroundColor: '#006672', // Reemplaza por tu color primario ('primary2')
                    paddingY: '12px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '16px',
                    '&:hover': {
                      backgroundColor: '#004d56',
                    }
                  }}
                >
                  Agregar
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}