import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';

export const ProductFormScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = id ? Number(id) : undefined;
  const isEditMode = Boolean(productId);

  const { currentProduct, loading, catalogs, createProduct, updateProduct } = useProducts(productId);

  // Estado del Genérico Base
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioBase, setPrecioBase] = useState(0);
  const [activo, setActivo] = useState(1);
  const [maxStock, setMaxStock] = useState(100);

  // Estados para simular las tablas cruzadas (Cruces)
  const [selectedColorId, setSelectedColorId] = useState<number>(1);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number>(1);
  const [costoExtraMaterial, setCostoExtraMaterial] = useState<number>(0);
  const [selectedTamanoId, setSelectedTamanoId] = useState<number>(1);
  const [alto, setAlto] = useState<number>(0);
  const [ancho, setAncho] = useState<number>(0);

  useEffect(() => {
    if (isEditMode && currentProduct) {
      setNombre(currentProduct.nombre);
      setDescripcion(currentProduct.descripcion);
      setPrecioBase(currentProduct.precio_base);
      setActivo(currentProduct.activo);
      setMaxStock(currentProduct.maximo_stock);
      
      // Mapea el primer elemento de los cruces si existen
      if (currentProduct.colores.length > 0) setSelectedColorId(currentProduct.colores[0].id_color);
      if (currentProduct.materiales.length > 0) {
        setSelectedMaterialId(currentProduct.materiales[0].id_material);
        setCostoExtraMaterial(currentProduct.materiales[0].costo_extra);
      }
      if (currentProduct.tamanos.length > 0) {
        setSelectedTamanoId(currentProduct.tamanos[0].id_tamano);
        setAlto(currentProduct.tamanos[0].alto);
        setAncho(currentProduct.tamanos[0].ancho);
      }
    }
  }, [isEditMode, currentProduct]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aquí es donde armamos la estructura relacional que solicita el endpoint
    const productPayload = {
      nombre,
      descripcion,
      precio_base: precioBase,
      activo,
      maximo_stock: maxStock,
      colores: [{ id_color: selectedColorId }],
      materiales: [{ id_material: selectedMaterialId, costo_extra: costoExtraMaterial }],
      tamanos: [{ id_tamano: selectedTamanoId, alto, ancho }],
      personalizaciones: [] // Opcional según selección
    };

    if (isEditMode && productId) {
      await updateProduct(productId, productPayload);
    } else {
      await createProduct(productPayload);
    }
    navigate('/products');
  };

  if (loading && isEditMode) return <p>Obteniendo información relacional del Genérico...</p>;

  return (
    <div>
      <h2>{isEditMode ? '⚙️ Editar Categoría de Prenda' : '➕ Crear Nueva Categoría General (Prenda)'}</h2>
      <form onSubmit={handleSave} style={{ background: '#fff', padding: '20px', borderRadius: '6px' }}>
        <h3>Datos Base (GENERICOS)</h3>
        <input type="text" placeholder="Nombre (ej. Polo Box)" value={nombre} onChange={e => setNombre(e.target.value)} required /><br/><br/>
        <input type="number" placeholder="Precio Base" value={precioBase} onChange={e => setPrecioBase(Number(e.target.value))} required /><br/><br/>
        <input type="number" placeholder="Stock Máximo" value={maxStock} onChange={e => setMaxStock(Number(e.target.value))} required /><br/><br/>
        
        <h3>Cruce Atributos (Figma selectores)</h3>
        <label>Color Dominante: </label>
        <select value={selectedColorId} onChange={e => setSelectedColorId(Number(e.target.value))}>
          {catalogs.mockColores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <br/><br/>

        <label>Material Textil: </label>
        <select value={selectedMaterialId} onChange={e => setSelectedMaterialId(Number(e.target.value))}>
          {catalogs.mockMateriales.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
        <input type="number" placeholder="Costo Extra Material" value={costoExtraMaterial} onChange={e => setCostoExtraMaterial(Number(e.target.value))} />
        <br/><br/>

        <label>Dimensión (Tamaño): </label>
        <select value={selectedTamanoId} onChange={e => setSelectedTamanoId(Number(e.target.value))}>
          {catalogs.mockTamanos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
        <input type="number" placeholder="Alto (cm)" value={alto} onChange={e => setAlto(Number(e.target.value))} />
        <input type="number" placeholder="Ancho (cm)" value={ancho} onChange={e => setAncho(Number(e.target.value))} />
        <br/><br/>

        <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px' }}>Guardar Todo</button>
      </form>
    </div>
  );
};
export default ProductFormScreen;